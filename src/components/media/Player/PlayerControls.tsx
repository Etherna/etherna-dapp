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

import PlayButton from "./controls/PlayButton"
import ProgressControl from "./controls/ProgressControl"
import TimeStatus from "./controls/TimeStatus"
import PlaybackRateControl from "./controls/PlaybackRateControl"
import PiPButton from "./controls/PiPButton"
import FullScreenButton from "./controls/FullScreenButton"
import VolumeControl from "./controls/VolumeControl"

const PlayerControls = () => {
  return (
    <div className="controls">
      {/* Progress */}
      <ProgressControl />

      {/* Play / Pause */}
      <PlayButton />

      {/* Time */}
      <TimeStatus />

      <div className="options-group">
        {/* Playback rate */}
        <PlaybackRateControl />

        {/* Picture in Picture */}
        {"pictureInPictureEnabled" in document && <PiPButton />}

        {/* Fullscreen */}
        <FullScreenButton />

        {/* Volume */}
        <VolumeControl />
      </div>
    </div>
  )
}

export default PlayerControls
