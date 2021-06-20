/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

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
          <button className="dropdown-back-btn" onClick={pop}>
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
