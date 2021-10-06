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

import classes from "@styles/components/player/PlayerToolbarProgress.module.scss"

import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"

const PlayerToolbarProgress: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { buffering, currentTime } = state

  const updateCurrentTime = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / rect.width

    dispatch({
      type: PlayerReducerTypes.UPDATE_PROGRESS,
      atPercent: time,
    })
  }

  return (
    <div
      className={classes.playerToolbarProgress}
      onClick={updateCurrentTime}
      role="button"
      tabIndex={0}
    >
      <div className={classes.playerToolbarProgressBuffering} style={{ width: `${buffering * 100}%` }} />
      <div className={classes.playerToolbarProgressTime} style={{ width: `${currentTime * 100}%` }} />
    </div>
  )
}

export default PlayerToolbarProgress
