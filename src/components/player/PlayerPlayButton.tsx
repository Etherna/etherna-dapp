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

import { ReactComponent as PauseIcon } from "@/assets/icons/player/pause.svg"
import { ReactComponent as PlayIcon } from "@/assets/icons/player/play.svg"

import { PlayerReducerTypes } from "@/context/player-context"
import { usePlayerState } from "@/context/player-context/hooks"

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
      className={classNames(
        "w-6 h-6 rounded-full p-1.5 z-0 bg-gray-100 text-gray-900",
        "md:w-8 md:h-8 md:p-2"
      )}
      onClick={togglePlay}
      role="button"
      tabIndex={0}
    >
      {isPlaying ? <PauseIcon aria-hidden /> : <PlayIcon className="ml-px" aria-hidden />}
    </div>
  )
}

export default PlayerPlayButton
