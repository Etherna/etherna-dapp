import React from "react"
import PropTypes from "prop-types"
import { NavLink } from "react-router-dom"

import makeBlockies from "@utils/makeBlockies"
import SwarmImage from "@components/common/SwarmImage"

const SidebarItem = ({ image, fallbackAddress, name, link }) => {
    return (
        <NavLink to={link} activeClassName="active" className="sidebar-item">
            <SwarmImage
                hash={image}
                fallback={makeBlockies(fallbackAddress)}
                className="sidebar-item-image"
                style={{}}
            />
            <div className="sidebar-item-title">{name}</div>
        </NavLink>
    )
}

SidebarItem.propTypes = {
    image: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    fallbackAddress: PropTypes.string,
    name: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
}

export default SidebarItem
