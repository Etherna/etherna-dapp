import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

const DropDownItemContent = ({ children, icon, status }) => {
  return (
    <div className="flex items-center w-full">
      {icon}
      <span>{children}</span>
      {status && (
        <span className={classnames("item-status", { [`item-status-${status}`]: true })} />
      )}
    </div>
  )
}

DropDownItemContent.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  status: PropTypes.oneOf(["active", "inactive"]),
}

DropDownItemContent.defaultProps = {
  status: null
}

export default DropDownItemContent
