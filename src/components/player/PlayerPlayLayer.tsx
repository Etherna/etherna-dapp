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

import { ReactComponent as PlayIcon } from "@/assets/icons/player/play.svg"

type PlayerPlayLayerProps = {
  thumbnailUrl?: string | null
  floating?: boolean
  onPlay(): void
}

const PlayerPlayLayer: React.FC<PlayerPlayLayerProps> = ({ thumbnailUrl, floating, onPlay }) => {
  return (
    <div
      className={classNames(
        "group absolute inset-0 bottom-15 flex",
        "after:block after:absolute after:inset-0 after:bg-black/5",
        "after:transition-colors after:duration-200 after:ease-out hover:after:bg-black/0",
        {
          "bottom-0": floating,
        }
      )}
      tabIndex={0}
      role="button"
      onClick={onPlay}
      data-component="player-play-layer"
    >
      {thumbnailUrl && (
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}
      <div
        className={classNames(
          "m-auto p-3 sm:p-4 bg-white text-gray-700 rounded rotate-45 shadow-lg",
          "transition-colors duration-200 ease-out",
          "group-hover:text-primary-500"
        )}
      >
        <PlayIcon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 -rotate-45" aria-hidden />
      </div>
    </div>
  )
}

export default PlayerPlayLayer
