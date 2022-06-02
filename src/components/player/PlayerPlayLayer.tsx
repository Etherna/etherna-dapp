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

import classes from "@/styles/components/player/PlayerPlayLayer.module.scss"
import { ReactComponent as PlayIcon } from "@/assets/icons/player/play.svg"

type PlayerPlayLayerProps = {
  thumbnailUrl?: string | null
  floating?: boolean
  onPlay(): void
}

const PlayerPlayLayer: React.FC<PlayerPlayLayerProps> = ({ thumbnailUrl, floating, onPlay }) => {
  return (
    <div
      className={classNames(classes.playerPlayLayer, {
        [classes.floating]: floating
      })}
      tabIndex={0}
      role="button"
      onClick={onPlay}
    >
      {thumbnailUrl && (
        <div className={classes.playerPlayLayerPoster} style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      )}
      <div className={classes.playerPlayLayerCommand}>
        <PlayIcon aria-hidden />
      </div>
    </div>
  )
}

export default PlayerPlayLayer
