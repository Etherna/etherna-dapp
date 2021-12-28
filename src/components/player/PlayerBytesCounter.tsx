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

import React, { useMemo } from "react"
import classNames from "classnames"

import classes from "@styles/components/player/PlayerBytesCounter.module.scss"

import { usePlayerState } from "@context/player-context/hooks"
import useSelector from "@state/useSelector"

const PlayerBytesCounter: React.FC = () => {
  const [state] = usePlayerState()
  const { sourceSize } = state

  const { bytePrice } = useSelector(state => state.env)
  const { credit } = useSelector(state => state.user)

  const remainingBytes = useMemo(() => {
    if (!sourceSize || !bytePrice) return null
    return Math.min(sourceSize, bytePrice > 0 ? (credit || 0) / bytePrice : 0)
  }, [credit, bytePrice, sourceSize])

  const remainingPercent = remainingBytes && sourceSize ? remainingBytes / sourceSize * 100 : 0

  if (!bytePrice || credit == null || remainingPercent >= 100) return null

  return (
    <div className={classNames(classes.counter, {
      [classes.unknown]: !sourceSize,
      [classes.limited]: sourceSize && remainingPercent > 0,
      [classes.zero]: sourceSize && remainingPercent === 0,
    })}>
      <span className={classes.counterSignal}>
        <span className={classes.counterSignalPing} />
        <span className={classes.counterSignalLight} />
      </span>
      <span className={classes.counterLabel}>
        {sourceSize ? `${remainingPercent}%` : "Unknown watch time"}
      </span>
      <span className={classes.counterLabel}>
        {
          !sourceSize
            ? " | We coudn't get an estimate for this video"
            : remainingPercent > 0
              ? ` | With your credit you can only enjoy ${remainingPercent}% of this video`
              : ` | Your credit is zero. Add some to enjoy this video`
        }
      </span>
    </div>
  )
}

export default PlayerBytesCounter
