import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./nav-pills.scss"

const NavPills = ({ children, className, vertical }) => {
  return (
    <nav
      className={classnames("nav-pills", className, {
        "nav-vertical": vertical,
      })}
    >
      {children}
    </nav>
  )
}

NavPills.propTypes = {
  className: PropTypes.string,
  vertical: PropTypes.bool,
}

export default NavPills
