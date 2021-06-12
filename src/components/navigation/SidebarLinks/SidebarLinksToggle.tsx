import React from "react"

import { ReactComponent as ExternalIcon } from "@svg/icons/navigation/external.svg"
import { ReactComponent as ArrowIcon } from "@svg/icons/arrow-fill-right.svg"

import SidebarItem from "@components/navigation/SidebarItem"

const SidebarLinksToggle: React.FC = () => {
  return (
    <div className="sidebar-links-toggle">
      <SidebarItem iconSvg={<ExternalIcon />} />
      <div className="sidebar-links-toggle-arrow">
        <ArrowIcon />
      </div>
    </div>
  )
}

export default SidebarLinksToggle
