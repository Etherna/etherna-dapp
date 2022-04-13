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
import classNames from "classnames"
import { Menu } from "@headlessui/react"

import classes from "@styles/components/common/DropdownToggle.module.scss"

type DropdownToggleProps = {
  children?: React.ReactNode
  className?: string
}

const DropdownToggle: React.FC<DropdownToggleProps> = ({ children, className }) => {
  return (
    <Menu.Button className={classNames(classes.dropdownToggle, className)}>
      {children}
    </Menu.Button>
  )
}

export default DropdownToggle
