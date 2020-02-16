import React from "react"
import { Link } from "gatsby"

const SidebarItem = ({ imageUrl, name, link }) => {
    return (
        <Link to={link} activeClassName="active" className="sidebar-item">
            <div
                className="sidebar-item-image"
                style={{ backgroundImage: `url(${imageUrl})` }}
            ></div>
            <div className="sidebar-item-title">{name}</div>
        </Link>
    )
}

export default SidebarItem
