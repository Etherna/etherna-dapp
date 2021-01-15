import React from "react"
import classnames from "classnames"

import { ReactComponent as BackIcon } from "@svg/icons/back-icon.svg"

import { useStateValue, ReducerTypes } from "./DropDownContext"

type DropDownMenuProps = {
  children: React.ReactNode
  title?: string
  menuRef: React.RefObject<HTMLDivElement>
  alignRight?: boolean
}

const DropDownMenu = ({ children, alignRight, menuRef, title }: DropDownMenuProps) => {
  const [state, dispatch] = useStateValue()
  const { history } = state
  const isDropDownOpen = state.current === menuRef

  const pop = () => {
    dispatch({
      type: ReducerTypes.POP_MENU,
      index: history.length - 1,
    })
  }

  return (
    <div
      ref={menuRef}
      className={classnames("dropdown-menu", {
        "menu-right": alignRight,
        open: isDropDownOpen,
      })}
    >
      {history.length > 1 && (
        <div className="dropdown-header">
          <button className="btn-back" onClick={pop}>
            <BackIcon />
          </button>
          <span className="ml-3">{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}

export default DropDownMenu
