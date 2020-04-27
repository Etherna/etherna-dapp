import React, { createContext, useContext, useReducer } from "react"

const PlayerContext = createContext()

export const ReducerTypes = {
    SET_VIDEO_ELEMENT: "SET_VIDEO_ELEMENT",
    TOGGLE_PLAY: "TOGGLE_PLAY",
    RESET_PLAY: "RESET_PLAY",
    TOGGLE_FULLSCREEN: "TOGGLE_FULLSCREEN",
    TOGGLE_PICTURE_IN_PICTURE: "TOGGLE_PICTURE_IN_PICTURE",
    TOGGLE_MUTED: "TOGGLE_MUTED",
    UPDATE_DURATION: "UPDATE_DURATION",
    UPDATE_PROGRESS: "UPDATE_PROGRESS",
    UPDATE_PLAYBACK_RATE: "UPDATE_PLAYBACK_RATE",
    UPDATE_VOLUME: "UPDATE_VOLUME",
    REFRESH_CURRENT_TIME: "REFRESH_CURRENT_TIME",
    REFRESH_BUFFERING: "REFRESH_BUFFERING",
}

const clamp = (val, min, max) => Math.min(Math.max(min, val), max)

const reducer = (state, action) => {
    switch (action.type) {

        case ReducerTypes.SET_VIDEO_ELEMENT: {
            return {
                ...state,
                videoEl: action.videoEl
            }
        }

        case ReducerTypes.TOGGLE_PLAY: {
            if (action.isPlaying) {
                if (state.currentTime === 1) {
                    state.videoEl.currentTime = 0
                }
                state.videoEl.play()
            } else {
                state.videoEl.pause()
            }
            return {
                ...state,
                isPlaying: !state.videoEl.paused
            }
        }

        case ReducerTypes.RESET_PLAY: {
            return {
                ...state,
                isPlaying: false,
                currentTime: 0,
            }
        }

        case ReducerTypes.TOGGLE_PICTURE_IN_PICTURE: {
            if (state.videoEl.requestPictureInPicture) {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture()
                } else {
                    state.videoEl.requestPictureInPicture()
                }
            }
            return {
                ...state,
            }
        }

        case ReducerTypes.TOGGLE_FULLSCREEN: {
            if (state.videoEl.mozRequestFullScreen) {
                state.videoEl.mozRequestFullScreen()
            } else if (state.videoEl.webkitRequestFullScreen) {
                state.videoEl.webkitRequestFullScreen()
            } else if (state.videoEl.requestFullscreen) {
                state.videoEl.requestFullscreen()
            }
            return {
                ...state,
            }
        }

        case ReducerTypes.TOGGLE_MUTED: {
            state.videoEl.muted = action.muted
            return {
                ...state,
                muted: action.muted
            }
        }

        case ReducerTypes.UPDATE_DURATION: {
            return {
                ...state,
                duration: action.duration
            }
        }

        case ReducerTypes.UPDATE_PROGRESS: {
            let currentTime = state.videoEl.currentTime
            if (action.bySec) {
                currentTime += action.bySec
            } else if (action.byPercent) {
                currentTime += action.byPercent * state.duration
            } else if (action.atPercent) {
                currentTime = action.atPercent * state.duration
            }
            currentTime = clamp(currentTime, 0, state.duration)

            state.videoEl.currentTime = currentTime

            return {
                ...state
            }
        }

        case ReducerTypes.UPDATE_PLAYBACK_RATE: {
            state.videoEl.playbackRate = action.playbackRate
            return {
                ...state,
                playbackRate: action.playbackRate
            }
        }

        case ReducerTypes.UPDATE_VOLUME: {
            let volume = state.videoEl.volume

            if (action.volume) {
                volume = action.volume
            } else if (action.byPercent) {
                volume += action.byPercent
            } else if (action.atPercent) {
                volume = action.atPercent
            }
            volume = clamp(volume, 0, 1)

            state.videoEl.volume = volume
            return {
                ...state,
                volume: volume
            }
        }

        case ReducerTypes.REFRESH_CURRENT_TIME: {
            const time = state.duration > 0
                ? state.videoEl.currentTime / state.duration
                : 0
            return {
                ...state,
                currentTime: time
            }
        }

        case ReducerTypes.REFRESH_BUFFERING: {
            let buffering = state.buffering
            for (let i = 0; i < state.videoEl.buffered.length; i++) {
                if (
                    state.videoEl.buffered.start(state.videoEl.buffered.length - 1 - i) <
                    state.videoEl.currentTime
                ) {
                    buffering = state.videoEl.buffered.end(state.videoEl.buffered.length - 1 - i) / state.duration
                    break
                }
            }

            return {
                ...state,
                buffering
            }
        }

        default:
            return state
    }
}

export const PlayerContextProvider = ({ children }) => {
    let store = useReducer(reducer, {
        videoEl: null,
        isPlaying: false,
        duration: 0,
        currentTime: 0,
        buffering: 0,
        volume: 1,
        muted: false,
        playbackRate: 1
    })
    return (
        <PlayerContext.Provider value={store}>
            {children}
        </PlayerContext.Provider>
    )
}

export const useStateValue = () => useContext(PlayerContext)
