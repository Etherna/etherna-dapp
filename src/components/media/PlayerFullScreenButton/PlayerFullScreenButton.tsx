import React from "react"

import { ReactComponent as FullScreenIcon } from "@svg/icons/player/fullscreen.svg"

import PlayerToolbarButton from "@components/media/PlayerToolbarButton"
import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerFullScreenButton: React.FC = () => {
  const [, dispatch] = usePlayerState()

  const toggleFullscreen = () => {
    dispatch({
      type: PlayerReducerTypes.TOGGLE_FULLSCREEN,
    })
  }

  return (
    <PlayerToolbarButton icon={<FullScreenIcon />} onClick={toggleFullscreen} />
  )
}

export default PlayerFullScreenButton
