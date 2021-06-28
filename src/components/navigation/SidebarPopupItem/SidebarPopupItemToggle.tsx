import React from "react"

import SidebarItem from "@components/navigation/SidebarItem"
import { SidebarItemProps } from "@components/navigation/SidebarItem/SidebarItem"

const SidebarPopupItemToggle: React.FC<SidebarItemProps> = (props) => {
  const itemProps = { ...props }

  return (
    <SidebarItem {...itemProps} compact isStatic>
      {props.children && (
        props.children
      )}
    </SidebarItem>
  )
}

export default SidebarPopupItemToggle
