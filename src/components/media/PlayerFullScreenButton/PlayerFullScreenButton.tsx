import React from "react"

import { ReactComponent as FullScreenIcon } from "@svg/icons/player/fullscreen-icon.svg"

import { useStateValue, ReducerTypes } from "@components/media/Player/PlayerContext"
import PlayerToolbarButton from "@components/media/PlayerToolbarButton"

const PlayerFullScreenButton: React.FC = () => {
  const [, dispatch] = useStateValue()

  const toggleFullscreen = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_FULLSCREEN,
    })
  }

  return (
    <PlayerToolbarButton icon={<FullScreenIcon />} onClick={toggleFullscreen} />
  )
}

export default PlayerFullScreenButton
