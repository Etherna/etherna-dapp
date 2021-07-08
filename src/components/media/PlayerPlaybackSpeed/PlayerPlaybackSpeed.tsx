import React from "react"

import { useStateValue, ReducerTypes } from "@components/media/Player/PlayerContext"
import PlayerToolbarSelect from "@components/media/PlayerToolbarSelect"

const PlayerPlaybackSpeed: React.FC = () => {
  const [state, dispatch] = useStateValue()
  const { playbackRate } = state
  const playbackTicks = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2]

  const updatePlaybackRate = (option: { value: string }) => {
    dispatch({
      type: ReducerTypes.UPDATE_PLAYBACK_RATE,
      playbackRate: +option.value,
    })
  }

  const optionLabel = (val: number) => `${val}X`

  return (
    <PlayerToolbarSelect
      value={playbackRate.toString()}
      options={playbackTicks.map(tick => ({ value: tick.toString(), label: optionLabel(tick) }))}
      onSelect={updatePlaybackRate}
    >
      <span>{optionLabel(playbackRate)}</span>
    </PlayerToolbarSelect>
  )
}

export default PlayerPlaybackSpeed
