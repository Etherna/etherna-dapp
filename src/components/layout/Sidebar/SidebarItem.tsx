import React from "react"
import { NavLink } from "react-router-dom"

import SwarmImg from "@components/common/SwarmImg"
import makeBlockies from "@utils/makeBlockies"
import SwarmImage from "@classes/SwarmImage"

type SidebarItemProps = {
  image: string | SwarmImage | undefined
  fallbackAddress?: string
  name: string
  link: string
}

const SidebarItem = ({ image, fallbackAddress, name, link }: SidebarItemProps) => {
  return (
    <NavLink to={link} activeClassName="active" className="sidebar-item">
      <SwarmImg
        image={image}
        fallback={makeBlockies(fallbackAddress)}
        className="sidebar-item-image"
        style={{}}
      />
      <div className="sidebar-item-title">{name}</div>
    </NavLink>
  )
}

export default SidebarItem
