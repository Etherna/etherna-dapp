import React, { useRef, useState, useEffect } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./player.scss"
import {
    PlayerContextProvider,
    ReducerTypes,
    useStateValue,
} from "./PlayerContext"
import PlayerControls from "./PlayerControls"
import PlayerShortcuts from "./PlayerShortcuts"

const InnerPlayer = ({ source, thumbnail }) => {
    const [state, dispatch] = useStateValue()
    const { isPlaying, currentTime } = state

    const [hiddenControls, setHiddenControls] = useState(false)
    const videoRef = useRef()

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
                >
                    <source src={source} />
                    <p className="text-center block">
                        It's time to upgrade your browser!!! <br />
                        <a href="https://www.google.com/chrome" target="blank">
                            Download Chrome
                        </a>
                    </p>
                </video>
                {!hiddenControls && videoRef.current && <PlayerControls />}
            </div>
        </PlayerShortcuts>
    )
}

const Player = ({ source, thumbnail }) => (
    <PlayerContextProvider>
        <InnerPlayer source={source} thumbnail={thumbnail} />
    </PlayerContextProvider>
)

Player.propTypes = {
    source: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
}

export default Player
