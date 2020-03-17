import React, { useRef, useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./player.scss"
import Time from "../Time"
import Slider from "@common/Slider"

const Player = ({ source }) => {
    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffering, setBuffering] = useState(0)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const videoRef = useRef()
    const playbackTicks = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2]

    const togglePlay = () => {
        const video = videoRef.current
        if (video.paused) {
            if (currentTime === 1) {
                video.currentTime = 0
            }
            video.play()
        } else {
            video.pause()
        }
        setPlaying(!video.paused)
    }

    const togglePictureInPicture = () => {
        const video = videoRef.current
        if (video.requestPictureInPicture) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture()
            } else {
                video.requestPictureInPicture()
            }
        }
    }

    const fullScreen = () => {
        const video = videoRef.current
        if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen()
        } else if (video.webkitRequestFullScreen) {
            video.webkitRequestFullScreen()
        } else if (video.requestFullscreen) {
            video.requestFullscreen()
        }
    }

    const toggleMute = () => {
        const video = videoRef.current
        if (video.muted) {
            video.muted = false
        } else {
            video.muted = true
        }
        setMuted(video.muted)
    }

    const updatePlaybackRate = rate => {
        const video = videoRef.current
        video.playbackRate = rate
        setPlaybackRate(rate)
    }

    const updateVolume = volume => {
        const video = videoRef.current
        video.volume = volume
        setVolume(volume)
    }

    const updateCurrentTime = e => {
        const video = videoRef.current
        const rect = e.target.getBoundingClientRect()
        const x = e.clientX - rect.left
        const time = x / rect.width
        video.currentTime = time * duration
    }

    // Video events

    const onLoadMetadata = () => {
        const video = videoRef.current
        setDuration(video.duration)
    }

    const onProgress = () => {
        const video = videoRef.current
        for (let i = 0; i < video.buffered.length; i++) {
            if (
                video.buffered.start(video.buffered.length - 1 - i) <
                video.currentTime
            ) {
                setBuffering(
                    video.buffered.end(video.buffered.length - 1 - i) / duration
                )
                break
            }
        }
    }

    const onTimeUpdate = () => {
        const video = videoRef.current
        const time = video.currentTime / duration
        setCurrentTime(time)

        if (time === 1) {
            setPlaying(false)
        }
    }

    return (
        <div className={classnames("player", { playing: playing })}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
                ref={videoRef}
                autoPlay={false}
                preload="metadata"
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
            <div className="controls">
                {/* Progress */}
                <div
                    className="video-progress"
                    onClick={updateCurrentTime}
                    onKeyDown={updateCurrentTime}
                    role="button"
                    tabIndex={0}
                >
                    <div
                        className="video-buffering"
                        style={{ width: `${buffering * 100}%` }}
                    />
                    <div
                        className="current-time"
                        style={{ width: `${currentTime * 100}%` }}
                    />
                </div>

                {/* Play / Pause */}
                <div
                    className="btn btn-play"
                    onClick={togglePlay}
                    onKeyDown={togglePlay}
                    role="button"
                    tabIndex={0}
                />

                {/* Time */}
                <div className="time-progress">
                    <Time duration={currentTime * duration} />
                    <span> / </span>
                    <Time duration={duration} />
                </div>

                <div className="options-group">
                    {/* Playback rate */}
                    <div className="option-group">
                        <div className="btn btn-option">
                            <span>{playbackRate}&times;</span>
                        </div>
                        <div className="option-menu">
                            <div className="tick-menu">
                                {playbackTicks.map(t => (
                                    <div
                                        className={classnames("tick-option", {
                                            active: t === playbackRate,
                                        })}
                                        onClick={() => updatePlaybackRate(t)}
                                        onKeyDown={() => updatePlaybackRate(t)}
                                        role="button"
                                        tabIndex={0}
                                        key={t}
                                    >
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Picture in Picture */}
                    {"pictureInPictureEnabled" in document && (
                        <div
                            className="btn btn-option"
                            onClick={togglePictureInPicture}
                            onKeyDown={togglePictureInPicture}
                            role="button"
                            tabIndex={0}
                        >
                            <img src={require("@svg/icons/pip-icon.svg")} alt="" />
                        </div>
                    )}

                    {/* Fullscreen */}
                    <div
                        className="btn btn-option"
                        onClick={fullScreen}
                        onKeyDown={fullScreen}
                        role="button"
                        tabIndex={0}
                    >
                        <img src={require("@svg/icons/fullscreen-icon.svg")} alt="" />
                    </div>

                    {/* Volume */}
                    <div className="option-group">
                        <div
                            className="btn btn-option"
                            onClick={toggleMute}
                            onKeyDown={toggleMute}
                            role="button"
                            tabIndex={0}
                        >
                            {muted === true ? (
                                <img src={require("@svg/icons/muted-icon.svg")} alt="" />
                            ) : volume < 0.25 ? (
                                <img src={require("@svg/icons/volume-low-icon.svg")} alt="" />
                            ) : (
                                <img src={require("@svg/icons/volume-icon.svg")} alt="" />
                            )}
                        </div>
                        <div className="option-menu">
                            <Slider
                                value={volume}
                                min={0}
                                max={1}
                                step={0.01}
                                invert={true}
                                orientation="vertical"
                                className="vertical-slider"
                                onChange={updateVolume}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

Player.propTypes = {
    source: PropTypes.string.isRequired,
}

export default Player
