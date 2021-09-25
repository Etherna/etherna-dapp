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

import "./player-toolbar.scss"

import PlayerToolbarProgress from "@components/media/PlayerToolbarProgress"
import PlayerPlayButton from "@components/media/PlayerPlayButton"
import PlayerTimeProgress from "@components/media/PlayerTimeProgress"
import PlayerPlaybackSpeed from "@components/media/PlayerPlaybackSpeed"
import PlayerFullScreenButton from "@components/media/PlayerFullScreenButton"
import PlayerPiPButton from "@components/media/PlayerPiPButton"
import PlayerVolume from "@components/media/PlayerVolume"

type PlayerToolbarProps = {
  floating?: boolean
}

const PlayerToolbar: React.FC<PlayerToolbarProps> = ({ floating }) => {
  return (
    <div className={classNames("player-toolbar", { floating })}>
      <PlayerToolbarProgress />

      <div className="player-toolbar-content">
        <div className="player-toolbar-playback-group">
          <PlayerPlayButton />
          <PlayerTimeProgress />
        </div>

        <div className="player-toolbar-video-setting-group">
          <PlayerPlaybackSpeed />
        </div>

        <div className="player-toolbar-video-setting-group">
          <PlayerVolume />
          {"pictureInPictureEnabled" in document && <PlayerPiPButton />}
          <PlayerFullScreenButton />
        </div>
      </div>
    </div>
  )
}

export default PlayerToolbar