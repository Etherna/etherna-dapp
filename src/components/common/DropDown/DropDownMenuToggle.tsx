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
