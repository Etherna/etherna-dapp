import React from "react"
import classnames from "classnames"
import { Menu } from "@headlessui/react"

type DropdownToggleProps = {
  className?: string
}

const DropdownToggle: React.FC<DropdownToggleProps> = ({ children, className }) => {
  return (
    <Menu.Button className={classnames("dropdown-toggle", className)}>
      {children}
    </Menu.Button>
  )
}

export default DropdownToggle
