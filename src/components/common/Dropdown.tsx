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
import { Menu } from "@headlessui/react"

import classes from "@styles/components/common/Dropdown.module.scss"

import DropdownMenu from "./DropdownMenu"

type DropdownProps = {
  children?: React.ReactNode
  forceOpen?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({ children, forceOpen }) => {
  return (
    <Menu as="div" className={classes.dropdown}>
      {({ open }) => {
        return (
          <>
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && (child as React.ReactElement).type === DropdownMenu) {
                return React.cloneElement(child, { open: forceOpen || open })
              }
              return child
            })}
          </>
        )
      }}
    </Menu>
  )
}

export default Dropdown
