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

import { ReactComponent as FullScreenIcon } from "@assets/icons/player/fullscreen.svg"

import PlayerToolbarButton from "./PlayerToolbarButton"
import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerFullScreenButton: React.FC = () => {
  const [, dispatch] = usePlayerState()

  const toggleFullscreen = () => {
    dispatch({
      type: PlayerReducerTypes.TOGGLE_FULLSCREEN,
    })
  }

  return (
    <PlayerToolbarButton icon={<FullScreenIcon />} onClick={toggleFullscreen} />
  )
}

export default PlayerFullScreenButton
