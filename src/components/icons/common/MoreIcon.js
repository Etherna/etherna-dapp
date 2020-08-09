import React from "react"
import PropTypes from "prop-types"

const MoreIcon = ({ className }) => {
  return (
    <svg width="18px" height="18px" viewBox="0 0 18 18" className={className}>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <circle fill="var(--color-gray-700)" cx="9" cy="5" r="1.5"></circle>
        <circle fill="var(--color-gray-700)" cx="9" cy="9.5" r="1.5"></circle>
        <circle fill="var(--color-gray-700)" cx="9" cy="14" r="1.5"></circle>
      </g>
    </svg>
  )
}

MoreIcon.propTypes = {
  className: PropTypes.string,
}

export default MoreIcon
