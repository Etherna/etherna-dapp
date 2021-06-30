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
        children={undefined}
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
