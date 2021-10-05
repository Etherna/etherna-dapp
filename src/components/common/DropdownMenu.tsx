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

import React, { Fragment } from "react"
import classNames from "classnames"
import { Menu, Transition } from "@headlessui/react"

import classes from "@styles/components/common/DropdownMenu.module.scss"

export type DropdownMenuProps = {
  open?: boolean
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, open }) => {
  return (
    <Transition
      show={open}
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className={classNames(classes.dropdownMenu)} static>
        {children}
      </Menu.Items>
    </Transition>
  )
}

export default DropdownMenu
