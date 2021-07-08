import React from "react"

import { ReactComponent as PipIcon } from "@svg/icons/player/pip-icon.svg"

import { useStateValue, ReducerTypes } from "@components/media/Player/PlayerContext"
import PlayerToolbarButton from "@components/media/PlayerToolbarButton"

const PlayerPiPButton: React.FC = () => {
  const [, dispatch] = useStateValue()

  const togglePictureInPicture = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_PICTURE_IN_PICTURE,
    })
  }

  return (
    <PlayerToolbarButton icon={<PipIcon />} onClick={togglePictureInPicture} />
  )
}

export default PlayerPiPButton
