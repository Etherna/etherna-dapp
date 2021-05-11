import React from "react"
import classnames from "classnames"

import { ReducerTypes, useStateValue } from "./DropDownContext"

type DropDownMenuToggleProps = {
  children: React.ReactNode
  menuRef: React.RefObject<HTMLDivElement>
  isMenuItem?: boolean
}

const DropDownMenuToggle = ({ children, menuRef, isMenuItem }: DropDownMenuToggleProps) => {
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

export default DropDownMenuToggle
