import React from "react"
import classNames from "classnames"

import "./player-play-button.scss"
import { ReactComponent as PlayIcon } from "@svg/icons/player/play-icon.svg"
import { ReactComponent as PauseIcon } from "@svg/icons/player/pause-icon.svg"

import { PlayerReducerTypes } from "@context/player-context"
import usePlayerState from "@context/player-context/hooks/usePlayerState"


const PlayerPlayButton: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { isPlaying } = state

  const togglePlay = () => {
    dispatch({
      type: PlayerReducerTypes.TOGGLE_PLAY,
      isPlaying: !isPlaying,
    })
  }

  return (
    <div
      className={classNames("player-play-button", { play: !isPlaying })}
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

export default PlayerPlayButton
