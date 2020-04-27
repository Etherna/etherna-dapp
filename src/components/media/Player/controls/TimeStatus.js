import React from "react"

import Time from "@components/media/Time"
import { useStateValue } from "../PlayerContext"

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