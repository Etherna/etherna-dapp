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

import React, { useCallback, useState } from "react"
import classNames from "classnames"

import { ReactComponent as MutedIcon } from "@/assets/icons/player/muted.svg"
import { ReactComponent as VolumeLowIcon } from "@/assets/icons/player/volume-low.svg"
import { ReactComponent as VolumeIcon } from "@/assets/icons/player/volume.svg"

import PlayerToolbarButton from "./PlayerToolbarButton"
import { Slider } from "@/components/ui/inputs"
import { PlayerReducerTypes } from "@/context/player-context"
import { usePlayerState } from "@/context/player-context/hooks"
import { isTouchDevice } from "@/utils/browser"

const PlayerVolume: React.FC = () => {
  const [isTouch] = useState(isTouchDevice())
  const [state, dispatch] = usePlayerState()
  const { muted, volume } = state

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      dispatch({
        type: PlayerReducerTypes.TOGGLE_MUTED,
        muted: !muted,
      })
    },
    [dispatch, muted]
  )

  const updateVolume = useCallback(
    (value: number | number[] | null | undefined) => {
      dispatch({
        type: PlayerReducerTypes.UPDATE_VOLUME,
        volume: value as number,
      })
    },
    [dispatch]
  )

  return (
    <PlayerToolbarButton
      icon={muted === true ? <MutedIcon /> : volume < 0.25 ? <VolumeLowIcon /> : <VolumeIcon />}
      onClick={isTouch ? undefined : toggleMute}
      hasMenu
    >
      {isTouch && (
        <button className="mb-3" onClick={toggleMute}>
          {muted ? <VolumeIcon height={16} /> : <MutedIcon height={16} />}
        </button>
      )}
      <Slider
        value={muted ? 0 : volume}
        min={0}
        max={1}
        step={0.01}
        invert={true}
        orientation="vertical"
        className="my-4 mx-auto h-32 w-2 touch-none rounded-full bg-white bg-opacity-50"
        renderTrack={(_, { index, value }) => (
          <div
            className={classNames("bottom-0 w-full rounded-full", {
              "bg-white": index === 0,
            })}
            style={{
              position: "absolute",
              top: index === 0 ? `${100 - value * 100}%` : 0,
              bottom: index === 0 ? 0 : `${100 - value * 100}%`,
            }}
            key={index}
          />
        )}
        renderThumb={(props, { valueNow }) => (
          <div
            className="-ml-1.5 -mb-1.5 h-5 w-5 rounded-full bg-white"
            style={{
              ...props.style,
              bottom: `${valueNow * 100}%`,
            }}
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            onFocus={props.onFocus}
            tabIndex={props.tabIndex}
            role={props.role}
            aria-orientation={props["aria-orientation"]}
            aria-valuenow={props["aria-valuenow"]}
            aria-valuemin={props["aria-valuemin"]}
            aria-valuemax={props["aria-valuemax"]}
            aria-label={props["aria-label"]}
            aria-labelledby={props["aria-labelledby"]}
            ref={props.ref}
            key={props.key}
          />
        )}
        onChange={updateVolume}
      />
    </PlayerToolbarButton>
  )
}

export default PlayerVolume
