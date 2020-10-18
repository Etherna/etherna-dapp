import React, { useEffect, useMemo, useRef } from "react"

import "./player-bytes-counter.scss"

import { useStateValue } from "../PlayerContext"
import useSelector from "@state/useSelector"

const CounterProgress = ({ ticksCount, percent }) => {
  const elRef = useRef(null)
  const ticks = new Array(ticksCount).fill(0)
  const percentTreshold = 25
  const minOpacity = 0.1

  useEffect(() => {
    /** @type {HTMLElement} */
    const element = elRef.current

    if (!element) return

    for (let i = 0; i < element.children.length; i++) {
      const tick = element.children.item(i)
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
    <div className="player-bytes-counter-progress" ref={elRef}>
      {ticks.map((_, i) => {
        const tickPercent = 100 / ticksCount * i
        const rangeLow = percent - percentTreshold
        const rangeHigh = percent + percentTreshold
        const opacity = tickPercent < rangeLow
          ? 1
          : tickPercent > rangeHigh
            ? minOpacity
            : 1 - ((tickPercent - rangeLow) / (rangeHigh - rangeLow)) + minOpacity
        return (
          <div
            className="player-bytes-counter-progress-tick"
            data-opacity={opacity}
            key={i}
          />
        )
      })}
    </div>
  )
}

const PlayerBytesCounter = () => {
  const [state] = useStateValue()
  const { sourceSize } = state

  const { bytePrice } = useSelector(state => state.env)
  const { credit } = useSelector(state => state.user)

  const remainingBytes = useMemo(() => {
    if (!sourceSize) return null
    return Math.min(sourceSize, credit / bytePrice)
  }, [credit, bytePrice, sourceSize])

  const remainingPercent = remainingBytes && remainingBytes / sourceSize * 100

  if (remainingPercent >= 100) return null

  return (
    <div className="player-bytes-counter">
      <CounterProgress ticksCount={8} percent={remainingPercent} />
      <span className="player-bytes-counter-label">
        {remainingPercent ? `${remainingPercent}%` : "Unknown"}
      </span>
      <span className="player-bytes-counter-label">
        {
          remainingPercent
            ? ` | With your credit you can only enjoy ${remainingPercent}% of this video`
            : "We coudn't get an estimate for this video"
        }
      </span>
    </div>
  )
}

export default PlayerBytesCounter
