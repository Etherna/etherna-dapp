import "@vidstack/react/player/styles/base.css"
import "@vidstack/react/player/styles/default/captions.css"

import React, { useEffect, useMemo, useRef } from "react"
import { Captions, isHLSProvider, MediaPlayer, MediaProvider, Track } from "@vidstack/react"

import { Spinner } from "../ui/display"
import { AudioLayout } from "./layouts/audio-layout"
import { VideoLayout } from "./layouts/video-layout"
import * as Overlays from "./overlays"
import { PlayerShortcuts } from "./shotcuts"
import { getSourceResolution } from "./utils"
import Fraction from "@/classes/Fraction"
import { useBzzUrlResolver } from "@/hooks/useBzzUrlResolver"
import useVideoTracking from "@/hooks/useVideoTracking"
import { usePlayerStore } from "@/stores/player"
import { cn } from "@/utils/classnames"
import { getAccessToken, withAccessToken } from "@/utils/jwt"

import type { VideoWithOwner } from "@/types/video"
import type {
  DASHSrc,
  HLSSrc,
  MediaPlayerInstance,
  MediaProviderAdapter,
  VideoSrc,
} from "@vidstack/react"

interface PlayerProps {
  videoManifest: Partial<VideoWithOwner>
  resourceId: string
  embed?: boolean
  bytePrice?: number
}

export function Player({ videoManifest, resourceId, embed, bytePrice }: PlayerProps) {
  const player = useRef<MediaPlayerInstance>(null)
  const viewType = usePlayerStore(state => state.viewType)
  const setBytePrice = usePlayerStore(state => state.setBytePrice)
  const setSources = usePlayerStore(state => state.setSources)
  const resolver = useBzzUrlResolver({ appendToken: true })

  useVideoTracking(player.current)

  const sources = useMemo(() => {
    if (!videoManifest?.details) {
      return []
    }
    return videoManifest.details.sources
      .map(s => ({
        ...s,
        url: s.type === "mp4" ? withAccessToken(s.url) : s.url,
      }))
      .sort((a, b) => getSourceResolution(b) - getSourceResolution(a))
  }, [videoManifest])

  const src = useMemo(() => {
    return sources
      .filter(
        s =>
          (s.type === "mp4" && viewType === "video") ||
          (s.type !== "mp4" && s.isMaster && viewType === "video") ||
          (s.type !== "mp4" && s.isAudio && viewType === "audio")
      )
      .map(source => {
        switch (source.type) {
          case "mp4":
            return {
              src: source.url,
              type: "video/mp4",
              bitrate: source.bitrate,
              height: parseInt(source.quality),
              width: Math.round(
                parseInt(source.quality) * (videoManifest.details?.aspectRatio ?? 16 / 9)
              ),
            } satisfies VideoSrc
          case "hls":
            return {
              src: source.url,
              type: "application/x-mpegurl",
            } satisfies HLSSrc
          case "dash":
            return {
              src: source.url,
              type: "application/dash+xml",
            } satisfies DASHSrc
        }
      })
  }, [sources, videoManifest.details?.aspectRatio, viewType])

  useEffect(() => {
    if (!player.current) {
      return
    }

    console.info("Video manifest: ", videoManifest)

    setSources(sources)
    setBytePrice(bytePrice ?? 0)

    // Subscribe to state updates.
    const unsub = player.current.subscribe(state => {
      // console.group("Player state")
      // console.debug("buffered", state.buffered)
      // console.debug("canPlay", state.canPlay)
      // console.debug("canSeek", state.canSeek)
      // console.debug("quality", state.quality, state.qualities)
      // console.debug("seekable", state.seekable)
      // console.debug("seeking", state.seeking)
      // console.debug("waiting", state.waiting)
      // console.groupEnd()
    })

    return () => {
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources])

  function onProviderChange(provider: MediaProviderAdapter | null) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js")
      provider.config.autoStartLoad = false
      provider.config.maxBufferLength = 3
      provider.config = {
        xhrSetup: (xhr: XMLHttpRequest) => {
          const token = getAccessToken()
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`)
          }
        },
      }
    }
  }

  return (
    <MediaPlayer
      ref={player}
      className={cn(
        "group relative w-full overflow-hidden bg-slate-50 bg-cover bg-no-repeat font-sans text-white ring-sky-500 data-[focus]:ring-4 dark:bg-slate-950",
        {
          "h-28": viewType === "audio",
          "h-56": viewType === "audio" && videoManifest.preview?.thumbnail,
          "max-h-[80vh] md:mx-0 md:rounded-md lg:mt-6 [&_video]:h-full": !embed,
          "landscape-touch:!fixed landscape-touch:inset-0 landscape-touch:z-50 landscape-touch:h-full landscape-touch:max-h-full md:landscape-touch:rounded-none":
            !embed,
          "h-screen w-screen": embed,
        }
      )}
      src={src}
      viewType={viewType}
      title={videoManifest.preview?.title}
      aspectRatio={
        viewType === "video"
          ? videoManifest.details?.aspectRatio
            ? Fraction.fromDecimal(videoManifest.details?.aspectRatio).toString()
            : "16 / 9"
          : undefined
      }
      preload="none"
      onProviderChange={onProviderChange}
      data-matomo-title={videoManifest.preview?.title}
      data-matomo-resource={resourceId}
      style={{
        backgroundImage: videoManifest.preview?.thumbnail?.blurredBase64
          ? `url(${videoManifest.preview?.thumbnail?.blurredBase64})`
          : undefined,
      }}
      keyDisabled
      crossOrigin
      playsInline
    >
      <MediaProvider>
        <Overlays.Poster
          thumbnail={videoManifest.preview?.thumbnail}
          alt={`Poster for ${videoManifest.preview?.title}`}
          crossOrigin
        />
        {videoManifest.details?.captions
          .sort((a, b) =>
            b.lang.startsWith("en")
              ? 1
              : a.lang.startsWith("en")
                ? -1
                : a.lang.localeCompare(b.lang)
          )
          .map(track => (
            <Track
              key={track.lang}
              src={
                videoManifest.reference ? resolver(videoManifest.reference, track.path) : undefined
              }
              kind="subtitles"
              label={track.label}
              lang={track.lang}
            />
          ))}
      </MediaProvider>

      {viewType === "audio" && player.current && <AudioLayout />}
      {viewType === "video" && player.current && <VideoLayout />}

      <Captions
        className="vds-captions media-captions absolute inset-x-0 bottom-2 z-10 select-none break-words opacity-0 transition-[opacity,bottom] duration-100 aria-hidden:hidden media-captions:opacity-100 media-controls:bottom-[85px] media-preview:opacity-0"
        style={{
          "--cue-default-font-size": "1rem",
        }}
      />

      {embed && <Overlays.WatchOnEtherna hash={resourceId} />}
      <Overlays.Startup />
      <Overlays.Loading />
      <Overlays.Error />

      <PlayerShortcuts />
    </MediaPlayer>
  )
}
