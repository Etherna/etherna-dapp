import React, { forwardRef, useMemo } from "react"
import { MediaOutlet, MediaPlayer } from "@vidstack/react"
import { isHLSProvider } from "vidstack"

import ErrorBanner from "./slices/ErrorBanner"
import FullScreenButton from "./slices/FullScreenButton"
import PiPButton from "./slices/PiPButton"
import PlaybackSpeed from "./slices/PlaybackSpeed"
import PlayButton from "./slices/PlayButton"
import QualityControl from "./slices/QualityControl"
import TimeProgress from "./slices/TimeProgress"
import VideoProgress from "./slices/VideoProgress"
import VolumeControl from "./slices/VolumeControl"
import Image from "@/components/common/Image"
import usePlayerStore from "@/stores/player"

import type { Profile, VideoSource } from "@etherna/sdk-js"
import type { MediaErrorEvent, MediaPlayerElement } from "vidstack"

type PlayerVideoProps = {
  title?: string
  hash: string
  source: VideoSource
  posterUrl?: string
  posterBlurDataURL?: string
  embed?: boolean
  owner: Profile | undefined | null
  xhrSetup?(xhr: XMLHttpRequest): void
  onPlaybackError?(err: MediaErrorEvent): void
}

const DEFAULT_SKIP = 15

const PlayerVideo = forwardRef<MediaPlayerElement, PlayerVideoProps>(
  (
    { title, hash, source, posterUrl, posterBlurDataURL, owner, embed, xhrSetup, onPlaybackError },
    ref
  ) => {
    const error = usePlayerStore(state => state.error)

    const src = useMemo(() => {
      return filterXSS(source.url)
    }, [source.url])

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
                <Image
                  className="mx-auto h-auto w-16 overflow-hidden rounded-lg sm:w-32"
                  src={posterUrl}
                  blurredDataURL={posterBlurDataURL}
                  placeholder={posterBlurDataURL ? "blur" : "empty"}
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
