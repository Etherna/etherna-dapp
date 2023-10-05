import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import { isHLSProvider, MediaPlayer, MediaProvider } from "@vidstack/react"

import BufferingIndicator from "./slices/BufferingIndicator"
import ClickToPlay from "./slices/ClickToPlay"
import ErrorBanner from "./slices/ErrorBanner"
import OwnerDetail from "./slices/OwnerDetail"
import Toolbar from "./slices/Toolbar"
import TouchOverlay from "./slices/TouchOverlay"
import VideoStarter from "./slices/VideoStarter"
import WatchOn from "./slices/WatchOn"
import Fraction from "@/classes/Fraction"
import usePlayerStore from "@/stores/player"
import { isTouchDevice } from "@/utils/browser"
import { withoutAccessToken } from "@/utils/jwt"

import type { Profile, VideoSource } from "@etherna/sdk-js"
import type { MediaErrorDetail, MediaErrorEvent, MediaPlayerInstance } from "@vidstack/react"

type PlayerVideoProps = {
  title?: string
  hash: string
  source: VideoSource
  sourceType?: "mp4" | "auto"
  posterUrl?: string
  posterBlurDataURL?: string
  embed?: boolean
  owner: Profile | undefined | null
  aspectRatio?: number | null
  xhrSetup?(xhr: XMLHttpRequest): void
  onPlaybackError?(err: MediaErrorDetail, event: MediaErrorEvent): void
}

const DEFAULT_SKIP = 5
const ACTIVE_TIMEOUT = 3000

const PlayerVideo = forwardRef<MediaPlayerInstance, PlayerVideoProps>(
  (
    {
      title,
      hash,
      source,
      sourceType,
      posterUrl,
      posterBlurDataURL,
      owner,
      embed,
      aspectRatio,
      xhrSetup,
      onPlaybackError,
    },
    ref
  ) => {
    const isPlaying = usePlayerStore(state => state.isPlaying)
    const currentTime = usePlayerStore(state => state.currentTime)
    const error = usePlayerStore(state => state.error)
    const [isFocus, setIsFocus] = useState(false)
    const focusTimeoutRef = useRef<number>()
    const isTouch = isTouchDevice()

    const src = useMemo(() => {
      return filterXSS(source.url)
    }, [source.url])

    const startFocusTimeout = useCallback(() => {
      focusTimeoutRef.current = window.setTimeout(() => {
        setIsFocus(false)
      }, ACTIVE_TIMEOUT)
    }, [])

    const onMouseEnter = useCallback(() => {
      if (isTouch) {
        startFocusTimeout()
      }
    }, [isTouch, startFocusTimeout])

    return (
      <MediaPlayer
        className="relative"
        src={
          sourceType === "mp4"
            ? {
                type: "video/mp4",
                src,
              }
            : withoutAccessToken(src)
        }
        poster={posterUrl}
        aspectRatio={aspectRatio ? Fraction.fromDecimal(aspectRatio).toString() : "16 / 9"}
        onProviderChange={provider => {
          if (isHLSProvider(provider)) {
            provider.library = () => import("hls.js")
            provider.config.autoStartLoad = false
            provider.config.maxBufferLength = 3
            provider.config.xhrSetup = xhrSetup
          }
        }}
        onMouseEnter={onMouseEnter}
        onError={onPlaybackError}
        ref={ref}
        data-matomo-title={title}
        data-src={src}
        crossorigin="anonymous"
        preload="none"
      >
        <MediaProvider className="aspect-[var(--media-aspect-ratio)] [&_video]:max-h-[80vh] [&_video]:w-full" />

        {error && <ErrorBanner />}

        {!error && (
          <>
            {!isPlaying && currentTime <= 0.1 && (
              <VideoStarter posterUrl={posterUrl} posterBlurDataURL={posterBlurDataURL} />
            )}

            {(isPlaying || currentTime > 0.1) && (
              <>
                <ClickToPlay />
                <Toolbar focus={isFocus} />
              </>
            )}

            {embed && (
              <>
                <OwnerDetail hash={hash} title={title || "Untitled"} owner={owner} />
                <WatchOn hash={hash} />
              </>
            )}

            {isTouchDevice() && currentTime > 0.1 && (
              <TouchOverlay focus={isFocus} skipBySeconds={DEFAULT_SKIP} />
            )}

            <BufferingIndicator />
          </>
        )}
      </MediaPlayer>
    )
  }
)

export default PlayerVideo
