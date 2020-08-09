import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import { ReducerTypes, useStateValue } from "./DropDownContext"

const DropDownMenuToggle = ({ children, menuRef, isMenuItem }) => {
  const [state, dispatch] = useStateValue()
  const { history } = state

  const toggleMenu = () => {
    const historyCopy = history.slice()
    const index = historyCopy.indexOf(menuRef)

    if (index >= 0) {
      dispatch({
        type: ReducerTypes.POP_MENU,
        index,
      })
    } else {
      dispatch({
        type: ReducerTypes.PUSH_MENU,
        menuRef,
      })
    }
  }

  return (
    <div
      className={classnames("dropdown-toggle", {
        "dropdown-item": isMenuItem,
      })}
      role="button"
      tabIndex={0}
      onClick={toggleMenu}
      onKeyDown={toggleMenu}
    >
      {children}
    </div>
  )
}

DropDownMenuToggle.propTypes = {
  menuRef: PropTypes.any.isRequired,
  isMenuItem: PropTypes.bool,
}

export default DropDownMenuToggle
