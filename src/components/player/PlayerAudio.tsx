import React, { forwardRef, useMemo } from "react"
import {
  ClickToPlay,
  Dash,
  DefaultControls,
  DefaultSettings,
  File,
  Hls,
  Player,
  Poster,
  Skeleton,
  Ui,
  ViewType,
} from "@vime/react"

import type { Profile, VideoSource } from "@etherna/api-js"

type PlayerAudioProps = {
  title?: string
  hash: string
  source: VideoSource
  posterUrl?: string
  embed?: boolean
  owner: Profile | undefined | null
  xhrSetup?(xhr: XMLHttpRequest): void
  onPlaybackError?(): void
}

const PlayerAudio = forwardRef<HTMLVmPlayerElement, PlayerAudioProps>(
  ({ title, hash, source, posterUrl, owner, embed, xhrSetup, onPlaybackError }, ref) => {
    const src = useMemo(() => {
      return filterXSS(source.url)
    }, [source.url])

    return (
      <Player ref={ref} viewType={ViewType.Video} data-matomo-title={title}>
        {source && (
          <>
            {source.type === "mp4" && (
              <File preload="none" onError={onPlaybackError}>
                <source src={src} type="video/mp4" />
              </File>
            )}
            {source.type === "hls" && (
              <Hls
                version="latest"
                config={{ xhrSetup }}
                poster={posterUrl}
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
                preload="none"
              />
            )}
          </>
        )}

        <Ui>
          <ClickToPlay />
          <DefaultControls activeDuration={3200} />
          <DefaultSettings />
          <Poster />
          <Skeleton />
        </Ui>
      </Player>
    )
  }
)

export default PlayerAudio
