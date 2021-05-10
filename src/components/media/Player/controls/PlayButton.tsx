import React from "react"

import { useStateValue, ReducerTypes } from "../PlayerContext"
import { ReactComponent as PlayIcon } from "@svg/icons/player/play-icon.svg"
import { ReactComponent as PauseIcon } from "@svg/icons/player/pause-icon.svg"

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
    >
      {isPlaying ? (
        <PauseIcon />
      ) : (
        <PlayIcon />
      )}
    </div>
  )
}

export default PlayButton
