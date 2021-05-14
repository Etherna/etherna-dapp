import React from "react"
import { Menu } from "@headlessui/react"

import "./dropdown.scss"

import DropdownMenu from "./DropdownMenu"

type DropdownProps = {
  forceOpen?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({ children, forceOpen }) => {
  return (
    <Menu as="div" className="dropdown">
      {({ open }) => {
        return React.Children.map(children, child => {
          if (React.isValidElement(child) && (child as React.ReactElement).type === DropdownMenu) {
            return React.cloneElement(child, { open: forceOpen || open })
          }
          return child
        })
      }}
    </Menu>
  )
}

export default Dropdown
