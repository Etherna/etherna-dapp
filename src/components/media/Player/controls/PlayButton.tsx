import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"

const PlayButton = () => {
  const [state, dispatch] = useStateValue()
  const { isPlaying } = state

  const togglePlay = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_PLAY,
      isPlaying: !isPlaying,
    })
  }

  return (
    <div
      className="btn btn-play"
      onClick={togglePlay}
      role="button"
      tabIndex={0}
    />
  )
}

export default PlayButton
