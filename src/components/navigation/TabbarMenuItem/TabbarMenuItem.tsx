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

import React, { useState } from "react"
import { Transition } from "@headlessui/react"

import "./tabbar-menu-item.scss"
import { ReactComponent as MenuIcon } from "@svg/icons/navigation/menu.svg"

import TabbarItem, { TabbarItemProps } from "@components/navigation/TabbarItem"

type TabbarMenuItemProps = TabbarItemProps & {

}

const TabbarMenuItem: React.FC<TabbarMenuItemProps> = (props) => {
  const [showMenu, setShowMenu] = useState(false)

  const toggleShowMenu = () => {
    setShowMenu(!showMenu)
  }

  return (
    <div className="tabbar-menu-item">
      <TabbarItem
        {...props}
        iconSvg={<MenuIcon />}
        onClick={toggleShowMenu}
      />

      <Transition
        show={showMenu}
        enter="fixed inset-x-0 transition duration-100 ease-in"
        enterFrom="fixed inset-x-0 transform translate-y-8 opacity-0"
        enterTo="fixed inset-x-0 transform translate-y-0 opacity-100"
        leave="fixed inset-x-0 transition duration-75 ease-in"
        leaveFrom="fixed inset-x-0 transform translate-y-0 opacity-100"
        leaveTo="fixed inset-x-0 transform translate-y-8 opacity-0"
      >
        <div className="tabbar-menu-item-menu">
          {props.children}
        </div>
      </Transition>
    </div>
  )
}

export default TabbarMenuItem
