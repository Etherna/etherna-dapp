import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"
import makeBlockie from "ethereum-blockies-base64"

const SidebarItem = ({ imageUrl, fallbackAddress, name, link }) => {
    const image = imageUrl || (fallbackAddress && makeBlockie(fallbackAddress))
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
