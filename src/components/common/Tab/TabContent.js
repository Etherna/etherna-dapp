import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

const TabContent = ({ children, active }) => {
  return (
    <div
      className={classnames("tab-content", {
        active: active,
      })}
    >
      {children}
    </div>
  )
}

TabContent.propTypes = {
  children: PropTypes.node,
  tabKey: PropTypes.string.isRequired,
  title: PropTypes.string,
  active: PropTypes.bool,
}

TabContent.defaultProps = {
  active: false,
}

export default TabContent
