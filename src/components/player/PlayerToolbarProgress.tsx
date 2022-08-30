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

import React, { useCallback, useRef, useState } from "react"
import classNames from "classnames"

import classes from "@/styles/components/player/PlayerToolbarProgress.module.scss"

import Slider from "@/components/common/Slider"
import Time from "@/components/media/Time"
import { PlayerReducerTypes } from "@/context/player-context"
import { usePlayerState } from "@/context/player-context/hooks"

type PlayerToolbarProgressProps = {
  focus?: boolean
}

const PlayerToolbarProgress: React.FC<PlayerToolbarProgressProps> = ({ focus }) => {
  const [state, dispatch] = usePlayerState()
  const { buffering, currentTime, duration } = state
  const [tooltipValue, setTooltipValue] = useState<number>()
  const [isHover, setIsHover] = useState(false)
  const progressContainer = useRef<HTMLDivElement>(null)

  const updateCurrentTime = useCallback((val: number) => {
    setTooltipValue(undefined)
    dispatch({
      type: PlayerReducerTypes.UPDATE_PROGRESS,
      atPercent: val / 100,
    })
  }, [dispatch,])

  return (
    <div
      className={classNames(classes.playerToolbarProgress, {
        [classes.focus]: focus || isHover,
        [classes.showTime]: isHover || tooltipValue !== undefined,
      })}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      ref={progressContainer}
    >
      <Slider
        className={classes.playerToolbarProgressSlider}
        value={currentTime * 100}
        min={0}
        max={100}
        step={0.001}
        renderTrack={({ className }, { index, value }) => (
          <div
            className={className}
            style={{
              position: "absolute",
              left: index === 0 ? 0 : `${value}%`,
              right: index === 1 ? 0 : `${100 - value}%`,
            }}
            key={index}
          />
        )}
        renderThumb={(props, { valueNow }) => (
          <div
            className={props.className}
            style={{
              ...props.style,
              left: `${valueNow}%`,
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
        onSliderClick={updateCurrentTime}
        onChange={val => setTooltipValue(val / 100)}
        onAfterChange={updateCurrentTime}
      />
      <div className={classes.playerToolbarProgressBuffering} style={{ width: `${buffering * 100}%` }} />
      <span
        className={classes.playerToolbarProgressTooltip}
        style={{
          left: (tooltipValue ?? currentTime) * (progressContainer.current?.clientWidth ?? 0) < 16
            ? 12
            : `${tooltipValue ?? currentTime * 100}%`
        }}
      >
        <Time duration={(tooltipValue ?? currentTime) * duration} />
      </span>
    </div>
  )
}

export default PlayerToolbarProgress
