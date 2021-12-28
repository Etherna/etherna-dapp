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

import classes from "@styles/components/player/PlayerBytesCounter.module.scss"

import { usePlayerState } from "@context/player-context/hooks"
import useSelector from "@state/useSelector"
import { convertTime } from "@utils/converters"

const PlayerBytesCounter: React.FC = () => {
  const [state] = usePlayerState()
  const { sourceSize, duration, currentTime } = state

  const { bytePrice } = useSelector(state => state.env)
  const { credit } = useSelector(state => state.user)

  if (!bytePrice || bytePrice === 0 || credit == null) return null

  const remainingDuration = duration - currentTime
  const remainingBytes = (sourceSize || 0) * (remainingDuration / duration)
  const remainingCost = remainingBytes * bytePrice
  const watchablePercent = remainingCost > 0 ? credit / remainingCost : 0
  const remainingSeconds = Math.round(watchablePercent * remainingDuration)

  if (watchablePercent >= 1) return null

  return (
    <div className={classNames(classes.counter, {
      [classes.unknown]: !sourceSize,
      [classes.limited]: sourceSize && watchablePercent > 0,
      [classes.zero]: sourceSize && watchablePercent === 0,
    })}>
      <span className={classes.counterSignal}>
        <span className={classes.counterSignalPing} />
        <span className={classes.counterSignalLight} />
      </span>
      <span className={classes.counterLabel}>
        {!sourceSize ? "Unknown watch time" : ""}
      </span>
      <span className={classes.counterLabel}>
        {!sourceSize && (
          <span>{" | We coudn't get an estimate for this video"}</span>
        )}
        {(sourceSize && remainingSeconds > 0) ? (
          <>
            <span>With your credit you can only enjoy the remaining </span>
            <span className={classes.counterAmount}>{convertTime(remainingSeconds).readable}</span>
            <span> of this video</span>
          </>
        ) : (
          <span>{"Your credit is zero. Add some to enjoy this video"}</span>
        )}
      </span>
    </div>
  )
}

export default PlayerBytesCounter
