import React from "react"
import PropTypes from "prop-types"

const DarkModeIcon = ({ className, color }) => {
  return (
    <svg className={className}>
      <g fill="none" fillRule="nonzero">
        <path d="M15.133 4.47l.81 1.228 1.227.81-1.205.773-.773 1.205-.809-1.229-1.228-.809 1.205-.773.773-1.205zm.021
          1.449l-.215.335-.335.216.341.225.226.342.215-.335.335-.216-.341-.225-.226-.342zM12.817
          3.6l.434.648.668.422-.668.422-.434.648-.434-.648-.668-.422.668-.422.434-.648z"
        fill={color}
        className={color ? undefined : "fill-gray-700 dark:fill-gray-300"}
        />
        <path d="M9.811 4.338c.1 0 .2.002.3.007a5.062 5.062 0 00-1.502 3.592c0 2.847 2.377 5.156 5.31 5.156.538 0
          1.057-.078 1.546-.222-.98 2.082-3.142 3.529-5.654 3.529-3.43 0-6.211-2.7-6.211-6.031 0-3.33 2.78-6.031
          6.211-6.031z"
        stroke={color}
        strokeWidth="1.2"
        className={color ? undefined : "stroke-gray-700 dark:stroke-gray-300"}
        />
      </g>
    </svg>
  )
}

DarkModeIcon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
  fillViewBox: PropTypes.bool,
}

export default DarkModeIcon
