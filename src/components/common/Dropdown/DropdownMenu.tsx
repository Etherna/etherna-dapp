import React, { Fragment } from "react"
import classnames from "classnames"
import { Menu, Transition } from "@headlessui/react"

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
      <Menu.Items className={classnames("dropdown-menu", { open })} static>
        {children}
      </Menu.Items>
    </Transition>
  )
}

export default DropdownMenu
