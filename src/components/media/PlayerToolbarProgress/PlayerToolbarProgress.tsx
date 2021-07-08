import React from "react"

import "./player-toolbar-progress.scss"

import { ReducerTypes, useStateValue } from "@components/media/Player/PlayerContext"

const PlayerToolbarProgress: React.FC = () => {
  const [state, dispatch] = useStateValue()
  const { buffering, currentTime } = state

  const updateCurrentTime = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / rect.width

    dispatch({
      type: ReducerTypes.UPDATE_PROGRESS,
      atPercent: time,
    })
  }

  return (
    <div
      className="player-toolbar-progress"
      onClick={updateCurrentTime}
      role="button"
      tabIndex={0}
    >
      <div className="player-toolbar-progress-buffering" style={{ width: `${buffering * 100}%` }} />
      <div className="player-toolbar-progress-time" style={{ width: `${currentTime * 100}%` }} />
    </div>
  )
}

export default PlayerToolbarProgress
