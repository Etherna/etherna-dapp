import React from "react"

import "./sidebar-links.scss"

import SidebarLinksList from "./SidebarLinksList"
import SidebarLinksToggle from "./SidebarLinksToggle"
import SidebarItem from "@components/navigation/SidebarItem"
import Popup from "@common/Popup"

type SidebarLinksProps = {

}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ children }) => {
  return (
    <div className="sidebar-links">
      <div className="sidebar-links-popup">
        <Popup toggle={<SidebarLinksToggle />} placement="right">
          <SidebarLinksList>
            {children}
          </SidebarLinksList>
        </Popup>
      </div>

      <div className="sidebar-links-flow">
        <SidebarItem as="div">
          <SidebarLinksList>
            {children}
          </SidebarLinksList>
        </SidebarItem>
      </div>
    </div>
  )
}

export default SidebarLinks
