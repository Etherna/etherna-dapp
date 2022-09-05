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

import { PauseIcon, PlayIcon } from "@heroicons/react/solid"

type PlayerTouchOverlayProps = {
  floating?: boolean
  isPlaying?: boolean
  focus?: boolean
  skipBySeconds?: number
  onFocus?(): void
  onPlayPause?(): void
  onSkipPrev?(): void
  onSkipNext?(): void
}

const PlayerTouchOverlay: React.FC<PlayerTouchOverlayProps> = ({
  floating,
  focus,
  isPlaying = false,
  skipBySeconds = 5,
  onFocus,
  onPlayPause,
  onSkipPrev,
  onSkipNext,
}) => {
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
          onSkipPrev?.()
          showSkipped("prev")
        } else {
          onSkipNext?.()
          showSkipped("next")
        }
      } else {
        clickTimer.current = window.setTimeout(() => onFocus?.(), 300)
      }
    },
    [isDoubleTouch, onFocus, onSkipNext, onSkipPrev, showSkipped]
  )

  return (
    <div
      className={classNames("absolute inset-0 bottom-[40px] md:bottom-15", {
        "bottom-0": floating,
      })}
      onClick={handleClick}
      ref={container}
    >
      <div
        className={classNames(
          "flex items-center px-2 py-1 space-x-2",
          "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full rounded-full",
          "bg-white border border-gray-900/20 shadow-lg shadow-gray-900/10",
          "text-xs font-medium text-gray-800",
          "transition-transform duration-200 ease-out",
          {
            "translate-y-3": skippedTo !== undefined,
          }
        )}
      >
        <span className="flex items-center rotate-180">
          <PlayIcon
            className={classNames("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "prev",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "200ms" }}
          />
          <PlayIcon
            className={classNames("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "prev",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "300ms" }}
          />
          <PlayIcon
            className={classNames("text-gray-800 opacity-20", {
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
            className={classNames("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "next",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "200ms" }}
          />
          <PlayIcon
            className={classNames("text-gray-800 opacity-20", {
              "animate-skip": skippedTo === "next",
            })}
            width={16}
            aria-hidden
            style={{ animationDelay: "300ms" }}
          />
          <PlayIcon
            className={classNames("text-gray-800 opacity-20", {
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
          className="p-2 rounded-full bg-white text-black absolute-center"
          onClick={onPlayPause}
        >
          {isPlaying ? <PauseIcon width={32} /> : <PlayIcon width={32} />}
        </button>
      )}
    </div>
  )
}

export default PlayerTouchOverlay
