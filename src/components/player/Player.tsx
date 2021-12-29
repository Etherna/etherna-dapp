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

import React, { useRef, useState, useEffect, useCallback } from "react"
import classNames from "classnames"
import Axios, { Canceler } from "axios"

import classes from "@styles/components/player/Player.module.scss"

import PlayerShortcuts from "./PlayerShortcuts"
import PlayerErrorBanner from "./PlayerErrorBanner"
import PlayerBytesCounter from "./PlayerBytesCounter"
import PlayerToolbar from "./PlayerToolbar"
import PlayerPlaceholder from "@components/placeholders/PlayerPlaceholder"
import { PlayerContextProvider, PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"
import http from "@utils/request"
import { isTouchDevice } from "@utils/browser"
import type { VideoSource } from "@definitions/swarm-video"

type PlayerProps = {
  title?: string
  sources: VideoSource[]
  originalQuality?: string | null
  thumbnail?: string | null
}

const InnerPlayer: React.FC<PlayerProps> = ({ title, sources, originalQuality, thumbnail }) => {
  const [state, dispatch] = usePlayerState()
  const { source, currentQuality, isPlaying, currentTime, error, videoEl } = state

  const [hiddenControls, setHiddenControls] = useState(false)
  const [idle, setIdle] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>()
  const videoMutationObserverRef = useRef<MutationObserver>()
  const idleTimeoutRef = useRef<number>()
  const floating = !isTouchDevice()

  useEffect(() => {
    if (originalQuality) {
      dispatch({
        type: PlayerReducerTypes.SET_CURRENT_QUALITY,
        currentQuality: originalQuality
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources])

  useEffect(() => {
    if (!sources.length) return

    const sourceInfo = sources.find(s => s.quality === currentQuality) || sources[0]
    dispatch({
      type: PlayerReducerTypes.SET_SOURCE,
      source: sourceInfo.source,
      size: sourceInfo.size || undefined
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuality])

  useEffect(() => {
    if (videoElement) {

      watchControlChange(videoElement)

      dispatch({
        type: PlayerReducerTypes.SET_VIDEO_ELEMENT,
        videoEl: videoElement,
      })
    }

    return () => {
      videoMutationObserverRef.current?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoElement, hiddenControls])

  useEffect(() => {
    if (currentTime === 1) {
      dispatch({
        type: PlayerReducerTypes.RESET_PLAY,
      })
    }
  }, [currentTime, dispatch])

  const watchControlChange = useCallback((video: HTMLVideoElement) => {
    if (videoMutationObserverRef.current) {
      videoMutationObserverRef.current.disconnect()
    }
    videoMutationObserverRef.current = new MutationObserver(mutations => {
      if (video.controls && !hiddenControls) {
        setHiddenControls(true)
      } else if (!video.controls && hiddenControls) {
        setHiddenControls(false)
      }
    })
    videoMutationObserverRef.current.observe(video, { attributes: true })
  }, [hiddenControls])

  const togglePlay = () => {
    const playing = !isPlaying
    dispatch({
      type: PlayerReducerTypes.TOGGLE_PLAY,
      isPlaying: playing,
    })

    if (playing) {
      startIdleTimeout(true)
    } else {
      stopIdleTimeout()
    }
  }

  const startIdleTimeout = (forceStart: boolean | React.MouseEvent = false) => {
    stopIdleTimeout()

    if (forceStart || isPlaying) {
      idleTimeoutRef.current = setTimeout(() => {
        setIdle(true)
      }, 3000) as unknown as number
    }
  }

  const stopIdleTimeout = () => {
    clearTimeout(idleTimeoutRef.current)
    setIdle(false)
  }

  const onMouseEnter = () => {
    if (isPlaying) {
      setIdle(false)
      startIdleTimeout()
    }
  }

  const onMouseMouse = () => {
    if (isPlaying) {
      startIdleTimeout()
    }
  }

  const onMouseLeave = () => {
    if (isPlaying) {
      clearTimeout(idleTimeoutRef.current)
      setIdle(true)
    }
  }

  // Video events

  const onLoadMetadata = () => {
    if (videoElement) {
      dispatch({
        type: PlayerReducerTypes.UPDATE_DURATION,
        duration: videoElement.duration,
      })
    }
  }

  const onProgress = () => {
    dispatch({
      type: PlayerReducerTypes.REFRESH_BUFFERING,
    })
  }

  const onTimeUpdate = () => {
    dispatch({
      type: PlayerReducerTypes.REFRESH_CURRENT_TIME,
    })
  }

  const renderError = (code: number, message: string) => {
    dispatch({
      type: PlayerReducerTypes.SET_PLAYBACK_ERROR,
      errorCode: code,
      errorMessage: message
    })
  }

  const onPlaybackError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (!source) return

    // get error code
    try {
      let cancelToken: Canceler | undefined
      await http.get(source, {
        withCredentials: true,
        onDownloadProgress: p => {
          // cancel large responses
          if (p.total > 1000) {
            cancelToken!("Network Error")
          }
        },
        cancelToken: new Axios.CancelToken(t => {
          cancelToken = t
        }),
      })
    } catch (error: any) {
      if (error.response) {
        renderError(error.response.status, error.response.data.message || error.response.data)
      } else {
        renderError(500, error.message)
      }
    }
  }

  if (!source) {
    return (
      <PlayerPlaceholder />
    )
  }

  return (
    <PlayerShortcuts>
      <div className={classNames(classes.player, {
        [classes.playing]: isPlaying,
        [classes.idle]: idle
      })}>
        <video
          ref={v => {
            if (v && v !== videoEl) {
              setVideoElement(v)
            }
          }}
          className={classes.playerVideo}
          autoPlay={false}
          preload="metadata"
          poster={!error && thumbnail ? thumbnail : undefined}
          controls={false}
          onMouseEnter={onMouseEnter}
          onMouseMove={onMouseMouse}
          onMouseLeave={onMouseLeave}
          onClick={togglePlay}
          onLoadedMetadata={onLoadMetadata}
          onProgress={onProgress}
          onPause={stopIdleTimeout}
          onTimeUpdate={onTimeUpdate}
          onError={onPlaybackError}
          data-matomo-title={title}
        >
          <source src={source} />
          <p className="text-center block">
            It&apos;s time to upgrade your browser!!! <br />
            <a href="https://www.google.com/chrome" target="_blank" rel="noopener noreferrer">
              Download Chrome
            </a>
          </p>
        </video>

        {!hiddenControls && videoElement && !error && (
          <div className={classNames(classes.playerToolbarWrapper, { floating })}>
            <PlayerToolbar floating={floating} idle={idle} />
          </div>
        )}

        {error && (
          <PlayerErrorBanner />
        )}
      </div>

      <PlayerBytesCounter />
    </PlayerShortcuts>
  )
}

const Player = (props: PlayerProps) => (
  <PlayerContextProvider>
    <InnerPlayer {...props} />
  </PlayerContextProvider>
)

export default Player
