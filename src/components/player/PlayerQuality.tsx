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

import React from "react"

import PlayerToolbarSelect from "./PlayerToolbarSelect"
import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerQuality: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { currentQuality, sourceQualities, videoEl } = state

  const updateQuality = (option: { value: string }) => {
    // Fix video element height jump
    videoEl!.style.height = `${videoEl!.clientHeight}px`
    setTimeout(() => {
      videoEl!.style.height = ""
    }, 500)

    dispatch({
      type: PlayerReducerTypes.SET_CURRENT_QUALITY,
      currentQuality: option.value,
    })
  }

  return (
    <PlayerToolbarSelect
      value={currentQuality ?? ""}
      options={sourceQualities.map(quality => ({ value: quality, label: quality }))}
      onSelect={updateQuality}
    >
      <span style={{ minWidth: "1.5rem" }}>{currentQuality}</span>
    </PlayerToolbarSelect>
  )
}

export default PlayerQuality
