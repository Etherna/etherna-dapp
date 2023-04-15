import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import { ClickToPlay, Controls, Dash, File, Hls, Player, Spinner, Ui, ViewType } from "@vime/react"

import ErrorBanner from "./slices/ErrorBanner"
import OwnerDetail from "./slices/OwnerDetail"
import Toolbar from "./slices/Toolbar"
import TouchOverlay from "./slices/TouchOverlay"
import VideoStarter from "./slices/VideoStarter"
import WatchOn from "./slices/WatchOn"
import usePlayerStore from "@/stores/player"
import { isTouchDevice } from "@/utils/browser"

import type { Profile, VideoSource } from "@etherna/api-js"

type PlayerVideoProps = {
  title?: string
  hash: string
  source: VideoSource
  posterUrl?: string
  embed?: boolean
  owner: Profile | undefined | null
  xhrSetup?(xhr: XMLHttpRequest): void
  onPlaybackError?(): void
}

const DEFAULT_SKIP = 5
const ACTIVE_TIMEOUT = 3000

const PlayerVideo = forwardRef<HTMLVmPlayerElement, PlayerVideoProps>(
  ({ title, hash, source, posterUrl, owner, embed, xhrSetup, onPlaybackError }, ref) => {
    const isPlaying = usePlayerStore(state => state.isPlaying)
    const currentTime = usePlayerStore(state => state.currentTime)
    const currentQuality = usePlayerStore(state => state.currentQuality)
    const isBuffering = usePlayerStore(state => state.isBuffering)
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
      <Player
        ref={ref}
        viewType={ViewType.Video}
        data-matomo-title={title}
        playbackQuality={currentQuality}
        // onMouseEnter={onMouseEnter}
      >
        {source && (
          <>
            {source.type === "mp4" && (
              <File
                preload="none"
                poster={posterUrl}
                crossOrigin="anonymous"
                onError={onPlaybackError}
              >
                <source src={src} type="video/mp4" />
              </File>
            )}
            {source.type === "hls" && (
              <Hls
                version="latest"
                config={{ xhrSetup }}
                poster={posterUrl}
                crossOrigin="anonymous"
                preload="none"
                onError={onPlaybackError}
              >
                <source src={src} type="application/x-mpegURL" />
              </Hls>
            )}
            {source.type === "dash" && (
              <Dash
                onError={onPlaybackError}
                src={src}
                version="latest"
                config={{ modifyRequestHeader: xhrSetup }}
                poster={posterUrl}
                crossOrigin="anonymous"
                preload="none"
              />
            )}
          </>
        )}

        <Ui>
          {error && <ErrorBanner />}

          {!error && (
            <>
              {currentTime === 0 && !isPlaying && !isBuffering && <VideoStarter />}

              {(isPlaying || currentTime > 0) && (
                <>
                  <ClickToPlay />
                  <Controls activeDuration={ACTIVE_TIMEOUT}>
                    <Toolbar focus={isFocus} />
                  </Controls>
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
            </>
          )}

          <Spinner showWhenMediaLoading />
        </Ui>
      </Player>
    )
  }
)

export default PlayerVideo
