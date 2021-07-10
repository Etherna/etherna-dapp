import React from "react"

import "./player-time-progress.scss"

import Time from "@components/media/Time"
import usePlayerState from "@context/player-context/hooks/usePlayerState"

const PlayerTimeProgress: React.FC = () => {
  const [state] = usePlayerState()
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
