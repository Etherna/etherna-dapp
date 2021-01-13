import React from "react"

import { useStateValue } from "../PlayerContext"
import Time from "@components/media/Time"

const TimeStatus = () => {
  const [state] = useStateValue()
  const { currentTime, duration } = state

  return (
    <div className="time-progress">
      <Time duration={currentTime * duration} />
      <span> / </span>
      <Time duration={duration} />
    </div>
  )
}

export default TimeStatus
