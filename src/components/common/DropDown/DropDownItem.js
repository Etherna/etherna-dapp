import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

const DropDownItem = ({ children, action, disabled, inactive }) => {

  const handleAction = () => {
    action && action()
  }

  const handleKeyDown = e => {
    if (e.keyCode === 13) {
      handleAction()
    }
  }

  return (
    <div
      className={classnames("dropdown-item", {
        disabled: disabled,
        inactive: inactive,
      })}
      role="button"
      tabIndex={0}
      onClick={handleAction}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

DropDownItem.propTypes = {
  action: PropTypes.func,
  disabled: PropTypes.bool,
  inactive: PropTypes.bool,
}

export default DropDownItem
