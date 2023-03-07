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
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { filterXSS } from "xss"

import PlayerBytesCounter from "./PlayerBytesCounter"
import PlayerErrorBanner from "./PlayerErrorBanner"
import PlayerPlayLayer from "./PlayerPlayLayer"
import PlayerShortcuts from "./PlayerShortcuts"
import PlayerToolbar from "./PlayerToolbar"
import PlayerTouchOverlay from "./PlayerTouchOverlay"
import PlayerVideoInfo from "./PlayerVideoInfo"
import PlayerWatchOn from "./PlayerWatchOn"
import PlayerPlaceholder from "@/components/placeholders/PlayerPlaceholder"
import { Spinner } from "@/components/ui/display"
import { PlayerContextProvider, PlayerReducerTypes } from "@/context/player-context"
import { usePlayerState } from "@/context/player-context/hooks"
import useVideoTracking from "@/hooks/useVideoTracking"
import { isTouchDevice } from "@/utils/browser"
import classNames from "@/utils/classnames"
import http from "@/utils/request"

import type { Profile, VideoSource } from "@etherna/api-js"

const DEFAULT_SKIP = 5

type PlayerProps = {
  hash: string
  title: string | undefined
  owner: Profile | undefined | null
  sources: VideoSource[]
  thumbnailUrl?: string | null
  embed?: boolean
}

const InnerPlayer: React.FC<PlayerProps> = ({
  hash,
  title,
  owner,
  sources,
  thumbnailUrl,
  embed,
}) => {
  const [state, dispatch] = usePlayerState()
  const { source, currentQuality, isPlaying, currentTime, error, videoEl } = state

  useVideoTracking(videoEl)

  const [isBuffering, setIsBuffering] = useState(false)
  const [hiddenControls, setHiddenControls] = useState(false)
  const [idle, setIdle] = useState(false)
  const [focus, setFocus] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>()
  const videoMutationObserverRef = useRef<MutationObserver>()
  const idleTimeoutRef = useRef<number>()
  const focusTimeoutRef = useRef<number>()

  const mp4Sources = useMemo(() => {
    return sources.filter(s => s.type === "mp4") as (VideoSource & { type: "mp4" })[]
  }, [sources])

  const [isTouch, floating] = useMemo(() => {
    const isTouch = isTouchDevice()
    const floating = !isTouch || embed
    return [isTouch, floating]
  }, [embed])

  const showControls = useMemo(() => {
    return !hiddenControls
    // const defaultShow = !hiddenControls && videoElement && !error
    // if (embed) {
    //   return defaultShow && currentTime > 0
    // }
    // return defaultShow
  }, [hiddenControls])

  useEffect(() => {
    if (!sources.length) return

    const sortedSources = mp4Sources
      .sort((a, b) => parseInt(a.quality) - parseInt(b.quality))
      .map(s => s.quality)
    const initialQuality = sortedSources.filter(q => parseInt(q) >= 360)[0] ?? sortedSources[0]

    dispatch({
      type: PlayerReducerTypes.SET_SOURCE_QUALITIES,
      qualities: sortedSources.reverse(),
    })
    dispatch({
      type: PlayerReducerTypes.SET_CURRENT_QUALITY,
      currentQuality: initialQuality,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mp4Sources])

  useEffect(() => {
    if (!mp4Sources.length) return

    const sourceInfo = mp4Sources.find(s => s.quality === currentQuality) || mp4Sources[0]
    dispatch({
      type: PlayerReducerTypes.SET_SOURCE,
      source: sourceInfo.url.replace(/\/?$/, "/"),
      size: sourceInfo.size || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuality])

  useEffect(() => {
    if (videoElement) {
      videoElement.onloadeddata = () => {
        videoElement.currentTime = currentTime * videoElement.duration
        isPlaying && videoElement.play()
      }
      videoElement.load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, videoElement])

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

  const watchControlChange = useCallback(
    (video: HTMLVideoElement) => {
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
    },
    [hiddenControls]
  )

  const stopIdleTimeout = useCallback(() => {
    clearTimeout(idleTimeoutRef.current)
    setIdle(false)
  }, [])

  const startIdleTimeout = useCallback(
    (forceStart: boolean | React.MouseEvent = false) => {
      stopIdleTimeout()

      if (forceStart || isPlaying) {
        idleTimeoutRef.current = window.setTimeout(() => {
          setIdle(true)
        }, 5000)
      }
    },
    [isPlaying, stopIdleTimeout]
  )

  const startFocusTimeout = useCallback(() => {
    focusTimeoutRef.current = window.setTimeout(() => {
      setFocus(false)
    }, 3000)
  }, [])

  const togglePlay = useCallback(() => {
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
  }, [isPlaying, dispatch, startIdleTimeout, stopIdleTimeout])

  const onMouseEnter = useCallback(() => {
    if (isPlaying) {
      setIdle(false)
      startIdleTimeout()
    }
    if (isTouch) {
      setFocus(true)
      startFocusTimeout()
    }
  }, [isPlaying, isTouch, startFocusTimeout, startIdleTimeout])

  const onMouseMouse = useCallback(() => {
    if (isPlaying) {
      startIdleTimeout()
    }
    startFocusTimeout()
  }, [isPlaying, startFocusTimeout, startIdleTimeout])

  const onMouseLeave = useCallback(() => {
    if (isPlaying) {
      clearTimeout(idleTimeoutRef.current)
      clearTimeout(focusTimeoutRef.current)
      setIdle(true)
      setFocus(false)
    }
  }, [isPlaying])

  const skipProgress = useCallback(
    (direction: "prev" | "next") => {
      dispatch({
        type: PlayerReducerTypes.UPDATE_PROGRESS,
        bySec: direction === "prev" ? -DEFAULT_SKIP : DEFAULT_SKIP,
      })
    },
    [dispatch]
  )

  // Video events

  const onLoadMetadata = useCallback(() => {
    if (videoElement) {
      dispatch({
        type: PlayerReducerTypes.UPDATE_DURATION,
        duration: videoElement.duration,
      })
    }
  }, [dispatch, videoElement])

  const onProgress = useCallback(() => {
    if (error) {
      dispatch({
        type: PlayerReducerTypes.SET_PLAYBACK_ERROR,
        errorCode: undefined,
        errorMessage: undefined,
      })
    }
    if (isBuffering) {
      setIsBuffering(false)
    }
    dispatch({
      type: PlayerReducerTypes.REFRESH_BUFFERING,
    })
  }, [dispatch, error, isBuffering])

  const onTimeUpdate = useCallback(() => {
    dispatch({
      type: PlayerReducerTypes.REFRESH_CURRENT_TIME,
    })
  }, [dispatch])

  const renderError = useCallback(
    (code: number, message: string) => {
      dispatch({
        type: PlayerReducerTypes.SET_PLAYBACK_ERROR,
        errorCode: code,
        errorMessage: message,
      })
    },
    [dispatch]
  )

  const onPlaybackError = useCallback(
    async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      setIsBuffering(false)

      const currentSrc = e.currentTarget.src
      if (!currentSrc) return

      // get error code
      try {
        await http.get(currentSrc, {
          withCredentials: true,
          headers: {
            Range: "bytes=0-1",
          },
        })
      } catch (error: any) {
        console.warn(error)

        if (error.response) {
          renderError(error.response.status, error.response.data.message || error.response.data)
        } else {
          renderError(500, error.message)
        }
      }
    },
    [renderError]
  )

  if (!source) {
    return !embed ? <PlayerPlaceholder /> : null
  }

  return (
    <PlayerShortcuts>
      <div
        className={classNames("relative z-0 flex flex-col overflow-hidden", {
          "-mx-4 mb-6 md:mx-0 lg:mt-6": !embed,
          "landscape-touch:fixed landscape-touch:inset-0 landscape-touch:z-10": !embed,
          "landscape-touch:mb-0 landscape-touch:pb-15": !embed,
          "h-screen w-screen": embed,
          "cursor-[none]": idle,
        })}
        onMouseEnter={floating ? onMouseEnter : undefined}
        onMouseMove={floating ? onMouseMouse : undefined}
        onMouseLeave={floating ? onMouseLeave : undefined}
        data-player
        data-playing={`${isPlaying}`}
        data-mouse-idle={`${idle}`}
      >
        <video
          ref={v => {
            if (v && v !== videoEl) {
              setVideoElement(v)
            }
          }}
          className={classNames(
            "group max-h-[80vh] w-full bg-white/50 object-contain dark:bg-black/50",
            {
              "landscape-touch:bg-gray-900 landscape-touch:dark:bg-gray-900": !embed,
              "landscape-touch:max-h-full landscape-touch:flex-shrink landscape-touch:flex-grow":
                !embed,
              "h-full max-h-screen": embed,
            }
          )}
          src={filterXSS(source)}
          autoPlay={false}
          preload="none"
          poster={!error && thumbnailUrl ? thumbnailUrl : undefined}
          controls={false}
          onClick={isTouch ? undefined : togglePlay}
          onLoadedMetadata={onLoadMetadata}
          onProgress={onProgress}
          onPlay={() => setIsBuffering(false)}
          onPause={stopIdleTimeout}
          onWaiting={() => setIsBuffering(true)}
          onTimeUpdate={onTimeUpdate}
          onError={onPlaybackError}
          onMouseOver={floating ? undefined : onMouseEnter}
          onMouseMove={floating ? undefined : onMouseMouse}
          onMouseLeave={floating ? undefined : onMouseLeave}
          data-matomo-title={title}
        />

        {showControls && (
          <div
            className={classNames(
              floating && {
                "absolute inset-x-0 bottom-0 z-[2] transition duration-100": true,
                "opacity-0": idle,
                "paused:opacity-100": currentTime > 0,
                "group-hover:opacity-100 mouse-idle:opacity-0": isPlaying,
              },
              {
                "landscape-touch:shrink-0": !embed,
              }
            )}
          >
            <PlayerToolbar floating={floating} focus={focus} />
          </div>
        )}

        {embed && !error && (
          <div
            className={classNames("absolute inset-x-0 top-0 z-1", {
              "group-hover:opacity-100": true,
              "opacity-100": !isPlaying,
              "opacity-0": isPlaying,
            })}
          >
            <PlayerVideoInfo hash={hash} title={title || "Untitled"} owner={owner} />
          </div>
        )}

        {embed && !error && (
          <div
            className={classNames(
              "absolute left-0 z-1 -translate-x-full",
              "transition-transform duration-200 ease-out",
              {
                "bottom-4": currentTime === 0,
                "bottom-16 md:bottom-24": currentTime > 0,
                "translate-x-0": !isPlaying,
              }
            )}
          >
            <PlayerWatchOn hash={hash} />
          </div>
        )}

        {!isPlaying && currentTime === 0 && !error && !isBuffering && (
          <PlayerPlayLayer
            thumbnailUrl={thumbnailUrl}
            floating={floating}
            embed={embed}
            onPlay={togglePlay}
          />
        )}

        {isTouchDevice() && currentTime > 0 && !error && (
          <PlayerTouchOverlay
            floating={floating}
            focus={focus}
            isPlaying={isPlaying}
            skipBySeconds={DEFAULT_SKIP}
            onFocus={onMouseEnter}
            onPlayPause={togglePlay}
            onSkipPrev={() => skipProgress("prev")}
            onSkipNext={() => skipProgress("next")}
          />
        )}

        {error && <PlayerErrorBanner />}

        {isBuffering && (
          <div className="absolute-center">
            <Spinner size={30} />
          </div>
        )}
      </div>

      {!embed && <PlayerBytesCounter />}
    </PlayerShortcuts>
  )
}

const Player = (props: PlayerProps) => (
  <PlayerContextProvider>
    <InnerPlayer {...props} />
  </PlayerContextProvider>
)

export default Player
