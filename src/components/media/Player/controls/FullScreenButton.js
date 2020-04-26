import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"

const FullScreenButton = () => {
    // eslint-disable-next-line no-unused-vars
    const [state, dispatch] = useStateValue()

    const toggleFullscreen = () => {
        dispatch({
            type: ReducerTypes.TOGGLE_FULLSCREEN
        })
    }

    return (
        <div
            className="btn btn-option"
            onClick={toggleFullscreen}
            onKeyDown={toggleFullscreen}
            role="button"
            tabIndex={0}
        >
            <img
                src={require("@svg/icons/fullscreen-icon.svg")}
                alt=""
            />
        </div>
    )
}

export default FullScreenButton