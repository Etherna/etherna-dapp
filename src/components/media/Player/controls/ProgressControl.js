import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"

const ProgressControl = () => {
    const [state, dispatch] = useStateValue()
    const { buffering, currentTime } = state

    const updateCurrentTime = e => {
        const rect = e.target.getBoundingClientRect()
        const x = e.clientX - rect.left
        const time = x / rect.width

        dispatch({
            type: ReducerTypes.UPDATE_PROGRESS,
            atPercent: time,
        })
    }

    return (
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
    )
}

export default ProgressControl
