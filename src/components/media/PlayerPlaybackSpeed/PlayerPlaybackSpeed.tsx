import React from "react"


import PlayerToolbarSelect from "@components/media/PlayerToolbarSelect"
import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerPlaybackSpeed: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { playbackRate } = state
  const playbackTicks = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2]

  const updatePlaybackRate = (option: { value: string }) => {
    dispatch({
      type: PlayerReducerTypes.UPDATE_PLAYBACK_RATE,
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
