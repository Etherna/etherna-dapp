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

import { useStateValue, ReducerTypes } from "../PlayerContext"
import { ReactComponent as PlayIcon } from "@svg/icons/player/play-icon.svg"
import { ReactComponent as PauseIcon } from "@svg/icons/player/pause-icon.svg"

const PlayButton = () => {
  const [state, dispatch] = useStateValue()
  const { isPlaying } = state

  const togglePlay = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_PLAY,
      isPlaying: !isPlaying,
    })
  }

  return (
    <div
      className="btn btn-play"
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

export default PlayButton
