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

import React, { useEffect, useMemo, useRef } from "react"

import classes from "@styles/components/player/PlayerBytesCounter.module.scss"

import { usePlayerState } from "@context/player-context/hooks"
import useSelector from "@state/useSelector"

type CounterProgressProps = {
  ticksCount: number
  percent: number
}

const CounterProgress: React.FC<CounterProgressProps> = ({ ticksCount, percent }) => {
  const elRef = useRef<HTMLDivElement>(null)
  const ticks = new Array(ticksCount).fill(0)
  const percentTreshold = 25
  const minOpacity = 0.1

  useEffect(() => {
    const element = elRef.current

    if (!element) return

    for (let i = 0; i < element.children.length; i++) {
      const tick = element.children.item(i)! as HTMLElement
      const opacity = tick.dataset.opacity || 0
      tick.animate([
        { opacity: 0 },
        { opacity: 1 },
        { opacity },
      ], {
        delay: i * 100 + 1000,
        duration: 500,
        fill: "forwards"
      })
    }

  }, [elRef])

  return (
    <div className={classes.playerBytesCounterProgress} ref={elRef}>
      {ticks.map((_, i) => {
        const tickPercent = 100 / ticksCount * i
        const fixedPercent = percent != null && !isNaN(percent) ? percent : 0
        const rangeLow = fixedPercent - percentTreshold
        const rangeHigh = fixedPercent + percentTreshold
        const opacity = tickPercent < rangeLow
          ? 1
          : tickPercent > rangeHigh
            ? minOpacity
            : 1 - ((tickPercent - rangeLow) / (rangeHigh - rangeLow)) + minOpacity
        return (
          <div
            className={classes.playerBytesCounterProgressTick}
            data-opacity={opacity}
            key={i}
          />
        )
      })}
    </div>
  )
}

const PlayerBytesCounter = () => {
  const [state] = usePlayerState()
  const { sourceSize } = state

  const { bytePrice } = useSelector(state => state.env)
  const { credit } = useSelector(state => state.user)

  const remainingBytes = useMemo(() => {
    if (!sourceSize || !bytePrice) return null
    return Math.min(sourceSize, bytePrice > 0 ? (credit || 0) / bytePrice : 0)
  }, [credit, bytePrice, sourceSize])

  const remainingPercent = remainingBytes && sourceSize ? remainingBytes / sourceSize * 100 : 0

  if (remainingPercent >= 100) return null

  return (
    <div className={classes.playerBytesCounter}>
      <CounterProgress ticksCount={8} percent={remainingPercent} />
      <span className={classes.playerBytesCounterLabel}>
        {remainingPercent ? `${remainingPercent}%` : "Unknown"}
      </span>
      <span className={classes.playerBytesCounterLabel}>
        {
          remainingPercent
            ? ` | With your credit you can only enjoy ${remainingPercent}% of this video`
            : " | We coudn't get an estimate for this video"
        }
      </span>
    </div>
  )
}

export default PlayerBytesCounter
