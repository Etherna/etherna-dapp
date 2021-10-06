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

import classes from "@styles/components/player/PlayerToolbar.module.scss"

import PlayerToolbarProgress from "./PlayerToolbarProgress"
import PlayerPlayButton from "./PlayerPlayButton"
import PlayerTimeProgress from "./PlayerTimeProgress"
import PlayerPlaybackSpeed from "./PlayerPlaybackSpeed"
import PlayerFullScreenButton from "./PlayerFullScreenButton"
import PlayerPiPButton from "./PlayerPiPButton"
import PlayerVolume from "./PlayerVolume"

type PlayerToolbarProps = {
  floating?: boolean
}

const PlayerToolbar: React.FC<PlayerToolbarProps> = ({ floating }) => {
  return (
    <div className={classNames(classes.playerToolbar, { [classes.floating]: floating })}>
      <PlayerToolbarProgress />

      <div className={classes.playerToolbarContent}>
        <div className={classes.playerToolbarPlaybackGroup}>
          <PlayerPlayButton />
          <PlayerTimeProgress />
        </div>

        <div className={classes.playerToolbarVideoSettingGroup}>
          <PlayerPlaybackSpeed />
        </div>

        <div className={classes.playerToolbarVideoSettingGroup}>
          <PlayerVolume />
          {"pictureInPictureEnabled" in document && <PlayerPiPButton />}
          <PlayerFullScreenButton />
        </div>
      </div>
    </div>
  )
}

export default PlayerToolbar
