import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import { MediaBufferingIndicator, MediaOutlet, MediaPlayer } from "@vidstack/react"
import { isHLSProvider } from "vidstack"

import BufferingIndicator from "./slices/BufferingIndicator"
import ClickToPlay from "./slices/ClickToPlay"
import ErrorBanner from "./slices/ErrorBanner"
import OwnerDetail from "./slices/OwnerDetail"
import Toolbar from "./slices/Toolbar"
import TouchOverlay from "./slices/TouchOverlay"
import VideoStarter from "./slices/VideoStarter"
import WatchOn from "./slices/WatchOn"
import usePlayerStore from "@/stores/player"
import { isTouchDevice } from "@/utils/browser"

import type { Profile, VideoSource } from "@etherna/sdk-js"
import type { MediaPlayerElement } from "vidstack"

type PlayerVideoProps = {
  title?: string
  hash: string
  source: VideoSource
  sourceType?: "mp4" | "auto"
  posterUrl?: string
  embed?: boolean
  owner: Profile | undefined | null
  aspectRatio?: number | null
  xhrSetup?(xhr: XMLHttpRequest): void
  onPlaybackError?(): void
}

const DEFAULT_SKIP = 5
const ACTIVE_TIMEOUT = 3000

const PlayerVideo = forwardRef<MediaPlayerElement, PlayerVideoProps>(
  (
    {
      title,
      hash,
      source,
      sourceType,
      posterUrl,
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
    const isBuffering = usePlayerStore(state => state.isBuffering)
    const error = usePlayerStore(state => state.error)
    const [isFocus, setIsFocus] = useState(false)
    const focusTimeoutRef = useRef<number>()
    const isTouch = isTouchDevice()

    const src = useMemo(() => {
      return filterXSS(source.url)
    }, [source.url])

    console.log(hash, src, source)

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
            : src
        }
        poster={posterUrl}
        aspectRatio={aspectRatio || 16 / 9}
        onProviderChange={e => {
          const provider = e.detail
          if (isHLSProvider(provider)) {
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
      >
        <MediaOutlet className="aspect-[var(--media-aspect-ratio)] h-auto w-full [&_video]:w-full" />

        {error && <ErrorBanner />}

        {!error && (
          <>
            {currentTime === 0 && !isPlaying && !isBuffering && (
              <VideoStarter posterUrl={posterUrl} />
            )}

            {(isPlaying || currentTime > 0) && (
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

            {isTouchDevice() && currentTime > 0 && (
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
