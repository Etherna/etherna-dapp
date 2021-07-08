import React from "react"

import "./player-time-progress.scss"

import { useStateValue } from "@components/media/Player/PlayerContext"
import Time from "@components/media/Time"

const PlayerTimeProgress: React.FC = () => {
  const [state] = useStateValue()
  const { currentTime, duration } = state

  return (
    <div className="player-time-progress">
      <Time duration={currentTime * duration} />
      <span> / </span>
      <Time duration={duration} />
    </div>
  )
}

export default PlayerTimeProgress
