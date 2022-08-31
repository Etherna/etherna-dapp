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

import classes from "@/styles/components/player/PlayerTouchOverlay.module.scss"
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
  const lastTouch = useRef<{ time: number, target: HTMLElement }>()

  const isDoubleTouch = (e: React.MouseEvent) => {
    const touchTap = {
      time: +new Date(),
      target: e.currentTarget as HTMLElement,
    }
    const isFastDblTouchTap = (
      touchTap.target === lastTouch.current?.target &&
      touchTap.time - lastTouch.current.time < 300
    )
    lastTouch.current = touchTap
    return isFastDblTouchTap
  }

  const showSkipped = useCallback((type: "prev" | "next") => {
    clearTimeout(skippedTimer.current)

    setSkippedTo(type)
    skippedTimer.current = window.setTimeout(() => {
      setSkippedTo(undefined)
    }, 3000)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
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
  }, [onFocus, onSkipNext, onSkipPrev, showSkipped])

  return (
    <div
      className={classNames(classes.playerTouchOverlay, {
        [classes.floating]: floating,
      })}
      onClick={handleClick}
      ref={container}
    >
      <div
        className={classNames(classes.playerTouchOverlaySkipped, {
          [classes.showSkipped]: skippedTo !== undefined,
        })}
      >
        <span
          className={classNames(classes.playerTouchOverlaySkippedPrev, {
            [classes.active]: skippedTo === "prev",
          })}
        >
          <PlayIcon width={16} aria-hidden />
          <PlayIcon width={16} aria-hidden />
          <PlayIcon width={16} aria-hidden />
        </span>
        <span>{skipBySeconds} seconds</span>
        <span
          className={classNames(classes.playerTouchOverlaySkippedNext, {
            [classes.active]: skippedTo === "next",
          })}
        >
          <PlayIcon width={16} aria-hidden />
          <PlayIcon width={16} aria-hidden />
          <PlayIcon width={16} aria-hidden />
        </span>
      </div>

      {focus && (
        <button className={classes.playerTouchOverlayPlay} onClick={onPlayPause}>
          {isPlaying ? (
            <PauseIcon width={32} />
          ) : (
            <PlayIcon width={32} />
          )}
        </button>
      )}
    </div >
  )
}

export default PlayerTouchOverlay
