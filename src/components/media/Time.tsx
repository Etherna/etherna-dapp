import React from "react"

import timeComponents from "@utils/timeComponents"

type TimeProps = {
  duration: number
}

const Time = ({ duration = 0 }: TimeProps) => {
  const { hours, minutes, seconds } = timeComponents(duration)

  return (
    <span>
      {hours ? `${hours}:` : null}
      {minutes}:{seconds}
    </span>
  )
}

export default Time
