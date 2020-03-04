import React from "react"
import PropTypes from "prop-types"

import timeComponents from "@utils/timeComponents"

const Time = ({ duration }) => {
    const { hours, minutes, seconds } = timeComponents(duration)

    return (
        <span>
            {hours ? `${hours}:` : null}
            {minutes}:{seconds}
        </span>
    )
}

Time.propTypes = {
    duration: PropTypes.number.isRequired,
}

export default Time
