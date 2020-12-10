import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./placeholder.scss"

const Placeholder = ({ width, height, ratio, round, className }) => {
  return (
    <div
      className={classnames("placeholder", className, {
        "rounded": round === true,
        "rounded-none": round === "none",
        "rounded-xs": round === "xs",
        "rounded-sm": round === "sm",
        "rounded-md": round === "md",
        "rounded-lg": round === "lg",
        "rounded-xl": round === "xl",
        "rounded-2xl": round === "2xl",
        "rounded-full": round === "full",
      })}
      style={{
        width,
        height: ratio ? "" : height,
        paddingTop: ratio ? `calc(${width} * ${ratio})` : ""
      }}
    />
  )
}

Placeholder.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  ratio: PropTypes.number,
  round: PropTypes.oneOf(["", "sm", "lg", "full", "none"]),
  className: PropTypes.string,
}

Placeholder.defaultProps = {
  width: "100%",
  height: "2rem",
  round: "",
}

export default Placeholder
