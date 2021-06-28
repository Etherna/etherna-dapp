import React from "react"

import "./sidebar-popup-item.scss"

import SidebarPopupItemToggle from "./SidebarPopupItemToggle"
import Popup from "@common/Popup"
import { SidebarItemProps } from "@components/navigation/SidebarItem/SidebarItem"

type SidebarPopupItemProps = SidebarItemProps & {
  toggle?: React.ReactNode
}

const SidebarPopupItem: React.FC<SidebarPopupItemProps> = (props) => {
  const Toggle = () => {
    return props.toggle ? (
      <SidebarPopupItemToggle {...props}>
        {props.toggle}
      </SidebarPopupItemToggle>
    ) : (
      <SidebarPopupItemToggle {...props} />
    )
  }

  return (
    <div className="sidebar-popup-item">
      <Popup toggle={<Toggle />} placement="right">
        {props.children}
      </Popup>
    </div>
  )
}

export default SidebarPopupItem
