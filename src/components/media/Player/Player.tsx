import React, { useRef, useState, useEffect, useCallback } from "react"
import classNames from "classnames"
import Axios, { Canceler } from "axios"

import "./player.scss"

import PlayerPlaceholder from "./PlayerPlaceholder"
import PlayerShortcuts from "./PlayerShortcuts"
import PlayerErrorBanner from "@components/media/PlayerErrorBanner"
import PlayerBytesCounter from "@components/media/PlayerBytesCounter"
import PlayerToolbar from "@components/media/PlayerToolbar"
import { VideoSource } from "@classes/SwarmVideo/types"
import { PlayerContextProvider, PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"
import http from "@utils/request"
import { isTouchDevice } from "@utils/browser"

type PlayerProps = {
  sources: VideoSource[]
  originalQuality?: string
  thumbnail?: string
}

const InnerPlayer: React.FC<PlayerProps> = ({ sources, originalQuality, thumbnail }) => {
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
    dispatch({
      type: PlayerReducerTypes.TOGGLE_PLAY,
      isPlaying: !isPlaying,
    })

    if (!isPlaying) {
      startIdleTimeout(true)
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
    } catch (error) {
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
      <div className={classNames("player", { playing: isPlaying, idle })}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={v => {
            if (v && v !== videoEl) {
              setVideoElement(v)
            }
          }}
          className="player-video"
          autoPlay={false}
          preload="metadata"
          poster={!error ? thumbnail : undefined}
          controls={false}
          onMouseEnter={startIdleTimeout}
          onMouseMove={startIdleTimeout}
          onMouseLeave={stopIdleTimeout}
          onClick={togglePlay}
          onLoadedMetadata={onLoadMetadata}
          onProgress={onProgress}
          onTimeUpdate={onTimeUpdate}
          onError={onPlaybackError}
        >
          <source src={source} />
          <p className="text-center block">
            It's time to upgrade your browser!!! <br />
            <a href="https://www.google.com/chrome" target="_blank" rel="noopener noreferrer">
              Download Chrome
            </a>
          </p>
        </video>

        {!hiddenControls && videoElement && !error && (
          <div className={classNames("player-toolbar-wrapper", { floating })}>
            <PlayerToolbar floating={floating} />
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
