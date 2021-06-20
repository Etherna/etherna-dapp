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
import Slider from "@common/Slider"
import { ReactComponent as MutedIcon } from "@svg/icons/player/muted-icon.svg"
import { ReactComponent as VolumeLowIcon } from "@svg/icons/player/volume-low-icon.svg"
import { ReactComponent as VolumeIcon } from "@svg/icons/player/volume-icon.svg"

const VolumeControl = () => {
  const [state, dispatch] = useStateValue()
  const { muted, volume } = state

  const toggleMute = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_MUTED,
      muted: !muted,
    })
  }

  const updateVolume = (value: number | number[] | null | undefined) => {
    dispatch({
      type: ReducerTypes.UPDATE_VOLUME,
      volume: value as number,
    })
  }

  return (
    <div className="option-group">
      <div
        className="btn btn-option"
        onClick={toggleMute}
        role="button"
        tabIndex={0}
      >
        {muted === true ? (
          <MutedIcon />
        ) : volume < 0.25 ? (
          <VolumeLowIcon />
        ) : (
          <VolumeIcon />
        )}
      </div>
      <div className="option-menu">
        <Slider
          value={volume}
          min={0}
          max={1}
          step={0.01}
          invert={true}
          orientation="vertical"
          className="vertical-slider"
          onChange={updateVolume}
        />
      </div>
    </div>
  )
}

export default VolumeControl
