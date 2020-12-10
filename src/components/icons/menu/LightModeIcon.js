import React from "react"
import PropTypes from "prop-types"

const LightModeIcon = ({ className, color }) => {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <path d="M10 14.5a.6.6 0 01.595.519l.005.081v2a.6.6 0 01-1.195.081L9.4 17.1v-2a.6.6 0 01.6-.6zm3.97-1.372l.06.054 1.415 1.414a.6.6 0
        01-.787.902l-.062-.053-1.414-1.414a.6.6 0 01.787-.903zm-7.152.054a.6.6 0 01.054.787l-.054.062-1.414 1.414a.6.6 0 01-.902-.787l.053-.062
        1.414-1.414a.6.6 0 01.849 0zM10 6.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6zm0 1.2a2.6 2.6 0 100 5.2 2.6 2.6 0 000-5.2zm7.1 2a.6.6 0 01.081
        1.195l-.081.005h-2a.6.6 0 01-.081-1.195L15.1 9.4h2zm-12.2 0a.6.6 0 01.081 1.195L4.9 10.6h-2a.6.6 0 01-.081-1.195L2.9 9.4h2zm10.545-4.845a.6.6
        0 01.053.787l-.053.062-1.414 1.414a.6.6 0 01-.903-.787l.054-.062 1.414-1.414a.6.6 0 01.849 0zM5.342 4.502l.062.053L6.818 5.97a.6.6 0
        01-.787.903l-.062-.054-1.414-1.414a.6.6 0 01.787-.902zM10 2.3a.6.6 0 01.595.519l.005.081v2a.6.6 0 01-1.195.081L9.4 4.9v-2a.6.6 0 01.6-.6z"
      fill={color}
      className={color ? undefined : "fill-gray-700 dark:fill-gray-300"}
      fillRule="nonzero" />
    </svg>
  )
}

LightModeIcon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
}

export default LightModeIcon
