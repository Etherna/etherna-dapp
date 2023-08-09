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

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid"

import usePlayerStore from "@/stores/player"
import { cn } from "@/utils/classnames"
import { clamp } from "@/utils/math"

type TouchOverlayProps = {
  focus?: boolean
  skipBySeconds?: number
}

const TouchOverlay: React.FC<TouchOverlayProps> = ({ focus, skipBySeconds = 5 }) => {
  const isPlaying = usePlayerStore(state => state.isPlaying)
  const currentTime = usePlayerStore(state => state.currentTime)
  const duration = usePlayerStore(state => state.duration)
  const floating = usePlayerStore(state => state.floating)
  const setCurrentTime = usePlayerStore(state => state.setCurrentTime)
  const togglePlay = usePlayerStore(state => state.togglePlay)
  const [skippedTo, setSkippedTo] = useState<"prev" | "next">()
  const clickTimer = useRef<number>()
  const skippedTimer = useRef<number>()
  const container = useRef<HTMLDivElement>(null)
  const lastTouch = useRef<{ time: number; target: HTMLElement }>()

  const isDoubleTouch = useCallback((e: React.MouseEvent) => {
    const touchTap = {
      time: +new Date(),
      target: e.currentTarget as HTMLElement,
    }
    const isFastDblTouchTap =
      touchTap.target === lastTouch.current?.target && touchTap.time - lastTouch.current.time < 300
    lastTouch.current = touchTap
    return isFastDblTouchTap
  }, [])

  const showSkipped = useCallback((type: "prev" | "next") => {
    clearTimeout(skippedTimer.current)

    setSkippedTo(type)
    skippedTimer.current = window.setTimeout(() => {
      setSkippedTo(undefined)
    }, 3000)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      clearTimeout(clickTimer.current)

      if (isDoubleTouch(e)) {
        e.preventDefault()
        e.stopPropagation()

        const relativeX = e.clientX - container.current!.offsetLeft
        const skipPrev = relativeX < container.current!.offsetWidth / 2

        if (skipPrev) {
          setCurrentTime(clamp(currentTime - skipBySeconds, 0, duration))
          showSkipped("prev")
        } else {
          setCurrentTime(clamp(currentTime + skipBySeconds, 0, duration))
          showSkipped("next")
        }
      }
    },
    [skipBySeconds, currentTime, duration, showSkipped, isDoubleTouch, setCurrentTime]
  )

  return (
    <div
      className={cn("absolute inset-0 bottom-[40px] md:bottom-15", {
        "bottom-0": floating,
      })}
      onClick={handleClick}
      ref={container}
    >
      <div
        className={cn(
          "flex items-center space-x-2 px-2 py-1",
          "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-full",
          "border border-gray-900/20 bg-white shadow-lg shadow-gray-900/10",
          "text-xs font-medium text-gray-800",
          "transition-transform duration-200 ease-out",
          {
            "translate-y-3": skippedTo !== undefined,
          }
        )}
      >
        <span className="flex rotate-180 items-center">
          <PlayIcon
            className={cn("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "prev",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "200ms" }}
          />
          <PlayIcon
            className={cn("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "prev",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "300ms" }}
          />
          <PlayIcon
            className={cn("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "prev",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "400ms" }}
          />
        </span>
        <span>{skipBySeconds} seconds</span>
        <span className="flex items-center">
          <PlayIcon
            className={cn("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "next",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "200ms" }}
          />
          <PlayIcon
            className={cn("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "next",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "300ms" }}
          />
          <PlayIcon
            className={cn("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "next",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "400ms" }}
          />
        </span>
      </div>

      {focus && (
        <button
          className="rounded-full bg-white p-2 text-black absolute-center"
          onClick={togglePlay}
        >
          {isPlaying ? <PauseIcon width={32} /> : <PlayIcon width={32} />}
        </button>
      )}
    </div>
  )
}

export default TouchOverlay
