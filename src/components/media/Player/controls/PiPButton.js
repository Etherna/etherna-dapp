import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"
import { ReactComponent as PipIcon } from "@svg/icons/pip-icon.svg"

const PiPButton = () => {
  const [,dispatch] = useStateValue()

  const togglePictureInPicture = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_PICTURE_IN_PICTURE,
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
      <PipIcon />
    </div>
  )
}

export default PiPButton
