import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"

const PiPButton = () => {
    // eslint-disable-next-line no-unused-vars
    const [state, dispatch] = useStateValue()

    const togglePictureInPicture = () => {
        dispatch({
            type: ReducerTypes.TOGGLE_PICTURE_IN_PICTURE
        })
    }

    return (
        <div
            className="btn btn-option"
            onClick={togglePictureInPicture}
            onKeyDown={togglePictureInPicture}
            role="button"
            tabIndex={0}
        >
            <img
                src={require("@svg/icons/pip-icon.svg")}
                alt=""
            />
        </div>
    )
}

export default PiPButton