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

import PlayerToolbarSelect from "./ToolbarSelect"
import usePlayerStore from "@/stores/player"

import type { PlayerQuality } from "@/stores/player"

const QualityControl: React.FC = () => {
  const currentQuality = usePlayerStore(state => state.currentQuality)
  const setCurrentQuality = usePlayerStore(state => state.setCurrentQuality)
  const qualities = usePlayerStore(state => state.qualities)

  const updateQuality = useCallback(
    (option: { value: string }) => {
      setCurrentQuality(option.value as PlayerQuality)
    },
    [setCurrentQuality]
  )

  return (
    <PlayerToolbarSelect
      value={currentQuality ?? ""}
      options={qualities.map(quality => ({ value: quality, label: quality }))}
      onSelect={updateQuality}
    >
      <span style={{ minWidth: "1.5rem" }}>{currentQuality}</span>
    </PlayerToolbarSelect>
  )
}

export default QualityControl
