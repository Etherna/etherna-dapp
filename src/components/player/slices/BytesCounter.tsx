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

import usePlayerStore from "@/stores/player"
import useSessionStore from "@/stores/session"
import useUserStore from "@/stores/user"
import classNames from "@/utils/classnames"
import { convertTime } from "@/utils/converters"

const BytesCounter: React.FC = () => {
  const currentTime = usePlayerStore(state => state.currentTime)
  const duration = usePlayerStore(state => state.duration)
  const currentSource = usePlayerStore(state => state.currentSource)

  const bytePrice = useSessionStore(state => state.bytesPrice)
  const credit = useUserStore(state => state.credit)

  const sourceSize = currentSource?.size

  const [watchablePercent, remainingSeconds] = useMemo(() => {
    if (!bytePrice || bytePrice === 0 || credit == null) return [null, null]

    const remainingDuration = duration - currentTime
    const remainingBytes = (sourceSize || 0) * (remainingDuration / duration)
    const remainingCost = remainingBytes * bytePrice
    const watchablePercent = remainingCost > 0 ? credit / remainingCost : 0
    const remainingSeconds = Math.round(watchablePercent * remainingDuration)

    return [watchablePercent, remainingSeconds]
  }, [bytePrice, credit, currentTime, duration, sourceSize])

  const [unknown, limited, zero] = useMemo(() => {
    const unknown = !sourceSize
    const limited = sourceSize && watchablePercent && watchablePercent > 0
    const zero = sourceSize && watchablePercent === 0
    return [unknown, limited, zero]
  }, [sourceSize, watchablePercent])

  if (!watchablePercent || watchablePercent >= 1) return null
  if (!remainingSeconds) return null

  return (
    <div
      className={classNames(
        "mb-6 mt-4 flex items-center text-xs font-medium",
        "text-gray-700 dark:text-gray-300"
      )}
      data-component="player-bytes-counter"
    >
      <span className="relative mr-1 flex h-3 w-3">
        <span
          className={classNames(
            "absolute inline-flex h-full w-full animate-[ping_1s_ease-out_1s_3] rounded-full",
            {
              "bg-gray-400/75 dark:bg-gray-400/75": unknown,
              "bg-amber-300/75 dark:bg-amber-300/75": limited,
              "bg-red-400/75 dark:bg-red-400/75": zero,
            }
          )}
        />
        <span
          className={classNames("relative inline-flex h-3 w-3 rounded-full", {
            "bg-gray-300 dark:bg-gray-500": unknown,
            "bg-amber-400 dark:bg-amber-500": limited,
            "bg-red-500 dark:bg-red-500": zero,
          })}
        />
      </span>
      <span className="ml-1">{!sourceSize ? "Unknown watch time" : ""}</span>
      <span className="ml-1">
        {!sourceSize && <span>{" | We coudn't get an estimate for this video"}</span>}
        {sourceSize && remainingSeconds > 0 ? (
          <>
            <span>With your credit you can only enjoy the remaining </span>
            <span
              className={classNames(
                "relative font-semibold text-gray-900 dark:text-gray-50",
                "after:absolute after:inset-x-0 after:top-full after:h-px after:bg-gray-50"
              )}
            >
              {convertTime(remainingSeconds).readable}
            </span>
            <span> of this video</span>
          </>
        ) : (
          <span>{"Your credit is zero. Add some to enjoy this video"}</span>
        )}
      </span>
    </div>
  )
}

export default BytesCounter
