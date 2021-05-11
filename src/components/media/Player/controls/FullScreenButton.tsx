import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"
import { ReactComponent as FullScreenIcon } from "@svg/icons/player/fullscreen-icon.svg"

const FullScreenButton = () => {
  const [, dispatch] = useStateValue()

  const toggleFullscreen = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_FULLSCREEN,
    })
  }

  return (
    <div
      className="btn btn-option"
      onClick={toggleFullscreen}
      role="button"
      tabIndex={0}
    >
      <FullScreenIcon />
    </div>
  )
}

export default FullScreenButton
