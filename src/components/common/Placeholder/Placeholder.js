import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./placeholder.scss"

const Placeholder = ({ width, height, round, className }) => {
  return (
    <div
      className={classnames("placeholder", className, {
        [`rounded${round !== "" ? "-" + round : round}`]: round !== "none",
      })}
      style={{
        width,
        height,
      }}
    />
  )
}

Placeholder.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  round: PropTypes.oneOf(["", "sm", "lg", "full", "none"]),
  className: PropTypes.string,
}

Placeholder.defaultProps = {
  width: "100%",
  height: "2rem",
  round: "",
}

export default Placeholder
