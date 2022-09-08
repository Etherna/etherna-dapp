/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React, { useCallback } from "react"

import PlayerToolbarSelect from "./PlayerToolbarSelect"
import { PlayerReducerTypes } from "@/context/player-context"
import { usePlayerState } from "@/context/player-context/hooks"

const PlayerPlaybackSpeed: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { playbackRate } = state
  const playbackTicks = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2]

  const updatePlaybackRate = useCallback(
    (option: { value: string }) => {
      dispatch({
        type: PlayerReducerTypes.UPDATE_PLAYBACK_RATE,
        playbackRate: +option.value,
      })
    },
    [dispatch]
  )

  const optionLabel = useCallback((val: number) => `${val}`, [])

  return (
    <PlayerToolbarSelect
      value={playbackRate.toString()}
      options={playbackTicks.map(tick => ({ value: tick.toString(), label: optionLabel(tick) }))}
      onSelect={updatePlaybackRate}
    >
      <span style={{ minWidth: "1.5rem" }}>{optionLabel(playbackRate)}⨉</span>
    </PlayerToolbarSelect>
  )
}

export default PlayerPlaybackSpeed
