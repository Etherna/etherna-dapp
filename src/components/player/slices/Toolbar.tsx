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

import FullScreenButton from "./FullScreenButton"
import PiPButton from "./PiPButton"
import PlaybackSpeed from "./PlaybackSpeed"
import PlayButton from "./PlayButton"
import Quality from "./QualityControl"
import TimeProgress from "./TimeProgress"
import VideoProgress from "./VideoProgress"
import Volume from "./VolumeControl"
import usePlayerStore from "@/stores/player"
import { cn } from "@/utils/classnames"

type ToolbarProps = {
  focus: boolean
}

const Toolbar: React.FC<ToolbarProps> = ({ focus }) => {
  const floating = usePlayerStore(state => state.floating)

  return (
    <div
      className={cn("flex w-full flex-col", {
        "bg-slate-700 dark:bg-slate-800": !floating,
        "absolute bottom-0 bg-gradient-to-t from-black to-black/0 px-3 pt-12 user-idle:hidden paused:flex":
          floating,
      })}
      data-component="player-toolbar"
    >
      <VideoProgress focus={focus} />

      <div
        className={cn("flex items-center space-x-3 py-1 sm:space-x-4 sm:p-3 md:space-x-8", {
          "px-1.5 xs:px-container": !floating,
          "px-0 xs:px-0": floating,
        })}
      >
        <div className="mr-auto flex items-center space-x-1 sm:space-x-3">
          <PlayButton />
          <TimeProgress />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <PlaybackSpeed />
          <Quality />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <Volume />
          {"pictureInPictureEnabled" in document && <PiPButton />}
          <FullScreenButton />
        </div>
      </div>
    </div>
  )
}

export default Toolbar
