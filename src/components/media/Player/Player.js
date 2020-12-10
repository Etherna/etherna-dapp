import React, { useRef, useState, useEffect } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import Axios from "axios"

import "./player.scss"

import { PlayerContextProvider, ReducerTypes, useStateValue } from "./PlayerContext"
import PlayerPlaceholder from "./PlayerPlaceholder"
import PlayerControls from "./PlayerControls"
import PlayerBytesCounter from "./PlayerBytesCounter"
import PlayerShortcuts from "./PlayerShortcuts"
import PlayerErrorBanner from "./PlayerErrorBanner"
import http from "@utils/request"

/**
 * @param {object} props
 * @param {import("@utils/video").VideoSourceInfo[]} props.sources
 * @param {string} props.originalQuality
 * @param {string} props.thumbnail
 */
const InnerPlayer = ({ sources, originalQuality, thumbnail }) => {
  const [state, dispatch] = useStateValue()
  const { source, currentQuality, isPlaying, currentTime, error } = state

  const [hiddenControls, setHiddenControls] = useState(false)
  const videoRef = useRef()

  useEffect(() => {
    dispatch({
      type: ReducerTypes.SET_CURRENT_QUALITY,
      source: originalQuality
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources])

  useEffect(() => {
    if (!sources.length) return

    const sourceInfo = sources.find(s => s.quality === currentQuality) || sources[0]
    dispatch({
      type: ReducerTypes.SET_SOURCE,
      source: sourceInfo.source,
      size: sourceInfo.size
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuality])

  useEffect(() => {
    if (videoRef && videoRef.current) {
      const video = videoRef.current
      const observer = new MutationObserver(mutations => {
        if (video.controls && !hiddenControls) {
          setHiddenControls(true)
        } else if (!video.controls && hiddenControls) {
          setHiddenControls(false)
        }
      })
      observer.observe(video, { attributes: true })

      dispatch({
        type: ReducerTypes.SET_VIDEO_ELEMENT,
        videoEl: video,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef])

  useEffect(() => {
    if (currentTime === 1) {
      dispatch({
        type: ReducerTypes.RESET_PLAY,
      })
    }
  }, [currentTime, dispatch])

  const togglePlay = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_PLAY,
      isPlaying: !isPlaying,
    })
  }

  // Video events

  const onLoadMetadata = () => {
    dispatch({
      type: ReducerTypes.UPDATE_DURATION,
      duration: videoRef.current.duration,
    })
  }

  const onProgress = () => {
    dispatch({
      type: ReducerTypes.REFRESH_BUFFERING,
    })
  }

  const onTimeUpdate = () => {
    dispatch({
      type: ReducerTypes.REFRESH_CURRENT_TIME,
    })
  }

  const onPlaybackError = async e => {
    // get error code
    try {
      let cancelToken
      await http.get(source, {
        withCredentials: true,
        onDownloadProgress: p => {
          // cancel large responses
          if (p.total > 1000) {
            cancelToken("Network Error")
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

  const renderError = (code, message) => {
    dispatch({
      type: ReducerTypes.SET_PLAYBACK_ERROR,
      errorCode: code,
      errorMessage: message
    })
  }

  if (!source) {
    return (
      <PlayerPlaceholder />
    )
  }

  return (
    <PlayerShortcuts>
      <div className={classnames("player", { playing: isPlaying })}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          autoPlay={false}
          preload="metadata"
          poster={thumbnail}
          controls={false}
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

        {!hiddenControls && videoRef.current && !error && (
          <PlayerControls />
        )}

        {error && (
          <PlayerErrorBanner />
        )}
      </div>
      <PlayerBytesCounter />
    </PlayerShortcuts>
  )
}

const Player = ({ sources, originalQuality, thumbnail }) => (
  <PlayerContextProvider>
    <InnerPlayer sources={sources} originalQuality={originalQuality} thumbnail={thumbnail} />
  </PlayerContextProvider>
)

Player.propTypes = {
  sources: PropTypes.array.isRequired,
  thumbnail: PropTypes.string,
}

export default Player
