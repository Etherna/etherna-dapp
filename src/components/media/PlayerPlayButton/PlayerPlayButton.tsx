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
import classNames from "classnames"

import "./player-play-button.scss"
import { ReactComponent as PlayIcon } from "@svg/icons/player/play.svg"
import { ReactComponent as PauseIcon } from "@svg/icons/player/pause.svg"

import { PlayerReducerTypes } from "@context/player-context"
import { usePlayerState } from "@context/player-context/hooks"


const PlayerPlayButton: React.FC = () => {
  const [state, dispatch] = usePlayerState()
  const { isPlaying } = state

  const togglePlay = () => {
    dispatch({
      type: PlayerReducerTypes.TOGGLE_PLAY,
      isPlaying: !isPlaying,
    })
  }

  return (
    <div
      className={classNames("player-play-button", { play: !isPlaying })}
      onClick={togglePlay}
      role="button"
      tabIndex={0}
    >
      {isPlaying ? (
        <PauseIcon />
      ) : (
        <PlayIcon />
      )}
    </div>
  )
}

export default PlayerPlayButton
