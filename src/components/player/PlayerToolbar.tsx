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

import PlayerFullScreenButton from "./PlayerFullScreenButton"
import PlayerPiPButton from "./PlayerPiPButton"
import PlayerPlayButton from "./PlayerPlayButton"
import PlayerPlaybackSpeed from "./PlayerPlaybackSpeed"
import PlayerQuality from "./PlayerQuality"
import PlayerTimeProgress from "./PlayerTimeProgress"
import PlayerToolbarProgress from "./PlayerToolbarProgress"
import PlayerVolume from "./PlayerVolume"
import classNames from "@/utils/classnames"

type PlayerToolbarProps = {
  floating?: boolean
  focus?: boolean
}

const PlayerToolbar: React.FC<PlayerToolbarProps> = ({ floating, focus }) => {
  return (
    <div
      className={classNames("flex flex-col", {
        "bg-slate-700 dark:bg-slate-800": !floating,
        "bg-gradient-to-t from-black to-black/0 px-3 pt-12": floating,
      })}
      data-component="player-toolbar"
    >
      <PlayerToolbarProgress focus={focus} />

      <div
        className={classNames("flex items-center space-x-3 py-1 sm:space-x-4 sm:p-3 md:space-x-8", {
          "px-1.5 xs:px-container": !floating,
          "px-0 xs:px-0": floating,
        })}
      >
        <div className="mr-auto flex items-center space-x-1 sm:space-x-3">
          <PlayerPlayButton />
          <PlayerTimeProgress />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <PlayerPlaybackSpeed />
          <PlayerQuality />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <PlayerVolume />
          {"pictureInPictureEnabled" in document && <PlayerPiPButton />}
          <PlayerFullScreenButton />
        </div>
      </div>
    </div>
  )
}

export default PlayerToolbar
