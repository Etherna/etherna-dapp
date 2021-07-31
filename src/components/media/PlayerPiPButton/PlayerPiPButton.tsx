import React from "react"

import { ReactComponent as PipIcon } from "@svg/icons/player/pip.svg"

import PlayerToolbarButton from "@components/media/PlayerToolbarButton"
import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerPiPButton: React.FC = () => {
  const [, dispatch] = usePlayerState()

  const togglePictureInPicture = () => {
    dispatch({
      type: PlayerReducerTypes.TOGGLE_PICTURE_IN_PICTURE,
    })
  }

  return (
    <PlayerToolbarButton icon={<PipIcon />} onClick={togglePictureInPicture} />
  )
}

export default PlayerPiPButton
