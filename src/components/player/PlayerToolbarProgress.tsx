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
import React, { useCallback, useMemo, useRef, useState } from "react"
import classNames from "classnames"

import Time from "@/components/media/Time"
import { Slider } from "@/components/ui/inputs"
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

  const [hasFocus, showTime] = useMemo(() => {
    const hasFocus = focus || isHover
    const showTime = isHover || tooltipValue !== undefined
    return [hasFocus, showTime]
  }, [isHover, tooltipValue, focus])

  const updateCurrentTime = useCallback(
    (val: number) => {
      setTooltipValue(undefined)
      dispatch({
        type: PlayerReducerTypes.UPDATE_PROGRESS,
        atPercent: val / 100,
      })
    },
    [dispatch]
  )

  return (
    <div
      className={classNames("relative w-full")}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      ref={progressContainer}
    >
      <Slider
        className="w-full h-1 transition duration-200;"
        value={currentTime * 100}
        min={0}
        max={100}
        step={0.001}
        renderTrack={(_, { index, value }) => (
          <div
            className={classNames("bg-gray-600 cursor-pointer h-full", {
              "bg-primary-500 z-1": index === 0,
            })}
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
            className={classNames(
              "mt-0.5 w-5 h-5 rounded-full",
              "-translate-x-1/2 -translate-y-1/2  bg-primary-500",
              "opacity-0 transition-opacity duration-200",
              {
                "opacity-100": hasFocus,
              }
            )}
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
      <div
        className="absolute left-0 top-0 h-full bg-primary-300/20 pointer-events-none"
        style={{ width: `${buffering * 100}%` }}
      />
      <span
        className={classNames(
          "mb-5 px-1 py-0.5 absolute left-0 bottom-0 -translate-x-1/2 rounded-sm",
          "scale-0 origin-center transition-transform duration-200",
          "text-xs font-medium bg-gray-900",
          {
            "scale-100": showTime,
          }
        )}
        style={{
          left:
            (tooltipValue ?? currentTime) * (progressContainer.current?.clientWidth ?? 0) < 16
              ? 12
              : `${tooltipValue ?? currentTime * 100}%`,
        }}
      >
        <Time duration={(tooltipValue ?? currentTime) * duration} />
      </span>
    </div>
  )
}

export default PlayerToolbarProgress
