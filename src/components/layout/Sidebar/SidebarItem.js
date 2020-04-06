import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import makeBlockies from "@utils/makeBlockies"

const SidebarItem = ({ imageUrl, fallbackAddress, name, link }) => {
    const image = imageUrl || (fallbackAddress && makeBlockies(fallbackAddress))
    return (
        <Link to={link} activeClassName="active" className="sidebar-item">
            <div
                className="sidebar-item-image"
                style={{ backgroundImage: `url(${image})` }}
            ></div>
            <div className="sidebar-item-title">{name}</div>
        </Link>
    )
}

SidebarItem.propTypes = {
    imageUrl: PropTypes.string,
    fallbackAddress: PropTypes.string,
    name: PropTypes.string,
    link: PropTypes.string,
}

export default SidebarItem
