import React from "react"
import PropTypes from "prop-types"

import "./progress-bar.scss"

const clamp = (num, min, max) => {
    return num <= min ? min : num >= max ? max : num
}

const ProgressBar = ({ progress }) => {
    progress = clamp(progress, 0, 100)
    return (
        <div className="progress">
            <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    )
}

ProgressBar.propTypes = {
    progress: PropTypes.number.isRequired,
}

export default ProgressBar
