/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React, { useCallback, useEffect, useMemo, useState } from "react"

import PlayerAudio from "./PlayerAudio"
import PlayerVideo from "./PlayerVideo"
import BytesCounter from "./slices/BytesCounter"
import PlayerShortcuts from "./slices/PlayerShortcuts"
import PlayerPlaceholder from "@/components/placeholders/PlayerPlaceholder"
import useVideoTracking from "@/hooks/useVideoTracking"
import usePlayerStore from "@/stores/player"
import { cn } from "@/utils/classnames"
import { getAccessToken } from "@/utils/jwt"
import http from "@/utils/request"

import type { Profile, VideoSource } from "@etherna/sdk-js"
import type { MediaErrorEvent, MediaPlayerElement } from "vidstack"

type PlayerProps = {
  hash: string
  title: string | undefined
  owner: Profile | undefined | null
  sources: VideoSource[]
  posterUrl?: string | null
  embed?: boolean
  aspectRatio?: number | null
}

const Player: React.FC<PlayerProps> = ({
  hash,
  title,
  owner,
  sources,
  posterUrl,
  embed,
  aspectRatio,
}) => {
  const [player, setPlayer] = useState<MediaPlayerElement | null>(null)
  const currentSource = usePlayerStore(state => state.currentSource)
  const isPlaying = usePlayerStore(state => state.isPlaying)
  const isIdle = usePlayerStore(state => state.isIdle)
  const loadPlayer = usePlayerStore(state => state.loadPlayer)
  const setSources = usePlayerStore(state => state.setSources)
  const showError = usePlayerStore(state => state.showError)
  useVideoTracking(player)

  const isMp4Source = useMemo(() => {
    return currentSource?.type === "mp4"
  }, [currentSource])

  const isAudioSource = useMemo(() => {
    return currentSource?.type !== "mp4" && /audio.(mpd|m3u8)$/.test(currentSource?.path ?? "")
  }, [currentSource])

  useEffect(() => {
    if (!player) return
    loadPlayer(player)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])

  useEffect(() => {
    setSources(sources)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources])

  const onPlaybackError = useCallback(
    async (err: MediaErrorEvent) => {
      console.error(err)

      if (!currentSource) return

      // get error code
      try {
        await http.get(currentSource.url, {
          headers: {
            Range: "bytes=0-0",
            Authorization: `Bearer ${getAccessToken()}`,
          },
        })
      } catch (error: any) {
        console.warn(error)

        if (error.response) {
          showError(error.response.status, error.response.data.message || error.response.data)
        } else {
          showError(500, error.message)
        }
      }
    },
    [currentSource, showError]
  )

  const xhrSetup = useCallback((xhr: XMLHttpRequest) => {
    const token = getAccessToken()
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }
  }, [])

  if (!currentSource) {
    return !embed ? <PlayerPlaceholder /> : null
  }

  return (
    <PlayerShortcuts>
      <div
        className={cn("relative z-0 flex flex-col overflow-hidden", {
          "-mx-4 mb-6 md:mx-0 lg:mt-6": !embed,
          "landscape-touch:fixed landscape-touch:inset-0 landscape-touch:z-10": !embed,
          "landscape-touch:mb-0 landscape-touch:pb-15": !embed,
          "h-screen w-screen": embed,
        })}
        data-player
        data-playing={`${isPlaying}`}
        data-mouse-idle={`${isIdle}`}
      >
        {currentSource && (
          <>
            {isAudioSource ? (
              <PlayerAudio
                title={title || hash}
                hash={hash}
                owner={owner}
                source={currentSource}
                posterUrl={posterUrl ?? undefined}
                embed={embed}
                xhrSetup={xhrSetup}
                onPlaybackError={onPlaybackError}
                ref={p => p && p !== player && setPlayer(p)}
              />
            ) : (
              <PlayerVideo
                title={title || hash}
                hash={hash}
                owner={owner}
                source={currentSource}
                sourceType={isMp4Source ? "mp4" : "auto"}
                posterUrl={posterUrl ?? undefined}
                embed={embed}
                aspectRatio={aspectRatio}
                xhrSetup={xhrSetup}
                onPlaybackError={onPlaybackError}
                ref={p => p && p !== player && setPlayer(p)}
              />
            )}
          </>
        )}
      </div>

      <BytesCounter />
    </PlayerShortcuts>
  )
}

export default Player
