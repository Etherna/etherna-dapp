import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import { MediaOutlet, MediaPlayer, MediaPoster } from "@vidstack/react"
import { isHLSProvider, Poster } from "vidstack"

import BufferingIndicator from "./slices/BufferingIndicator"
import ClickToPlay from "./slices/ClickToPlay"
import ErrorBanner from "./slices/ErrorBanner"
import FullScreenButton from "./slices/FullScreenButton"
import OwnerDetail from "./slices/OwnerDetail"
import PiPButton from "./slices/PiPButton"
import PlaybackSpeed from "./slices/PlaybackSpeed"
import PlayButton from "./slices/PlayButton"
import QualityControl from "./slices/QualityControl"
import TimeProgress from "./slices/TimeProgress"
import Toolbar from "./slices/Toolbar"
import TouchOverlay from "./slices/TouchOverlay"
import VideoProgress from "./slices/VideoProgress"
import VideoStarter from "./slices/VideoStarter"
import VolumeControl from "./slices/VolumeControl"
import WatchOn from "./slices/WatchOn"
import usePlayerStore from "@/stores/player"
import { isTouchDevice } from "@/utils/browser"

import type { Profile, VideoSource } from "@etherna/api-js"
import type { MediaPlayerElement } from "vidstack"

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

const PlayerVideo = forwardRef<MediaPlayerElement, PlayerVideoProps>(
  ({ title, hash, source, posterUrl, owner, embed, xhrSetup, onPlaybackError }, ref) => {
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
        src={src}
        poster={posterUrl}
        viewType="audio"
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
        <MediaOutlet className="hidden" />

        <div className="flex flex-col">
          {error && <ErrorBanner />}

          {!error && (
            <div className="flex flex-wrap items-center xs:flex-nowrap">
              <div className="flex w-full pl-3 xs:w-auto sm:pl-0">
                <img
                  src={posterUrl}
                  className="mx-auto h-auto w-16 overflow-hidden rounded-lg sm:w-32"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="flex flex-1 flex-grow flex-col items-center p-3">
                <div className="flex items-center">
                  {/* Skip << */}
                  <PlayButton />
                  {/* Skip >> */}
                </div>
                <VideoProgress className="my-2" focus={false} />
                <TimeProgress className="pb-3" />
              </div>

              <div className="flex items-center space-x-1 pr-3 sm:pr-0">
                <PlaybackSpeed />
                <QualityControl />
                <VolumeControl />
                {"pictureInPictureEnabled" in document && <PiPButton />}
                <FullScreenButton />
              </div>
            </div>
          )}
        </div>
      </MediaPlayer>
    )
  }
)

export default PlayerVideo
