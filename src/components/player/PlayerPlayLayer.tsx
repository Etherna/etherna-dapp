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

import { ReactComponent as PlayIcon } from "@/assets/icons/player/play.svg"

import classNames from "@/utils/classnames"

type PlayerPlayLayerProps = {
  thumbnailUrl?: string | null
  floating?: boolean
  embed?: boolean
  onPlay(): void
}

const PlayerPlayLayer: React.FC<PlayerPlayLayerProps> = ({
  thumbnailUrl,
  floating,
  embed,
  onPlay,
}) => {
  return (
    <div
      className={classNames(
        "group absolute inset-0 z-1 flex",
        "after:absolute after:inset-0 after:block after:bg-black/5",
        "after:transition-colors after:duration-200 after:ease-out hover:after:bg-black/0",
        {
          "bottom-15": !floating && !embed,
          "bottom-0": floating || embed,
        }
      )}
      tabIndex={0}
      role="button"
      onClick={onPlay}
      data-component="player-play-layer"
    >
      {thumbnailUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}
      <div
        className={classNames(
          "m-auto rotate-45 rounded bg-white p-3 text-gray-700 shadow-lg sm:p-4",
          "transition-colors duration-200 ease-out",
          "group-hover:text-primary-500"
        )}
      >
        <PlayIcon className="h-4 w-4 -rotate-45 sm:h-6 sm:w-6 md:h-8 md:w-8" aria-hidden />
      </div>
    </div>
  )
}

export default PlayerPlayLayer
