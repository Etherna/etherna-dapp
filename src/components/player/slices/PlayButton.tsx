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

import { ReactComponent as PauseIcon } from "@/assets/icons/player/pause.svg"
import { ReactComponent as PlayIcon } from "@/assets/icons/player/play.svg"

import usePlayerStore from "@/stores/player"
import classNames from "@/utils/classnames"

const PlayButton: React.FC = () => {
  const isPlaying = usePlayerStore(state => state.isPlaying)
  const togglePlay = usePlayerStore(state => state.togglePlay)

  return (
    <div
      className={classNames(
        "z-0 h-6 w-6 rounded-full bg-gray-100 p-1.5 text-gray-900",
        "md:h-8 md:w-8 md:p-2"
      )}
      onClick={togglePlay}
      role="button"
      tabIndex={0}
    >
      {isPlaying ? <PauseIcon aria-hidden /> : <PlayIcon className="ml-px" aria-hidden />}
    </div>
  )
}

export default PlayButton
