import React from "react"
import PropTypes from "prop-types"

import SidebarItem from "../sidebar-item"

const ReccomendedChannels = ({ channels }) => {
    return (
        <div className="sidenav-menu">
            <label className="sidebar-label" htmlFor="">Reccomended Channels</label>
            {channels.map(channel => {
                return <SidebarItem
                    imageUrl={channel.imageUrl}
                    name={channel.name}
                    link={ `/channel/${channel.address}` }
                    key={channel.address}
                />
            })}
        </div>
    )
}

ReccomendedChannels.propTypes = {
    channels: PropTypes.arrayOf(
        PropTypes.shape({
            address: PropTypes.string,
            name: PropTypes.string
        })
    )
}

ReccomendedChannels.defaultProps = {
    channels: []
}

export default ReccomendedChannels