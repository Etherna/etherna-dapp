import React from "react"
import classnames from "classnames"

import { useStateValue, ReducerTypes } from "../PlayerContext"

const PlaybackRateControl = () => {
  const [state, dispatch] = useStateValue()
  const { playbackRate } = state
  const playbackTicks = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2]

  const updatePlaybackRate = (value: number) => {
    dispatch({
      type: ReducerTypes.UPDATE_PLAYBACK_RATE,
      playbackRate: value,
    })
  }

  return (
    <div className="option-group">
      <div className="btn btn-option">
        <span>{playbackRate}&times;</span>
      </div>
      <div className="option-menu">
        <div className="tick-menu">
          {playbackTicks.map(t => (
            <div
              className={classnames("tick-option", {
                active: t === playbackRate,
              })}
              onClick={() => updatePlaybackRate(t)}
              onKeyDown={() => updatePlaybackRate(t)}
              role="button"
              tabIndex={0}
              key={t}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlaybackRateControl
