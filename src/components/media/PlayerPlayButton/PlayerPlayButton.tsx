import React from "react"
import classNames from "classnames"

import "./player-play-button.scss"
import { ReactComponent as PlayIcon } from "@svg/icons/player/play-icon.svg"
import { ReactComponent as PauseIcon } from "@svg/icons/player/pause-icon.svg"

import { ReducerTypes, useStateValue } from "@components/media/Player/PlayerContext"

const PlayerPlayButton: React.FC = () => {
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
