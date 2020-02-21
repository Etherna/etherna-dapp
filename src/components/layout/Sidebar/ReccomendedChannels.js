import React from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import * as Routes from "@routes"

const ReccomendedChannels = ({ channels }) => {
    return (
        <div className="sidenav-menu">
            <h6 className="sidebar-label">Reccomended Channels</h6>
            {channels.map(channel => {
                return (
                    <SidebarItem
                        imageUrl={channel.imageUrl}
                        name={channel.name}
                        link={Routes.getChannelLink(channel.address)}
                        key={channel.address}
                    />
                )
            })}
        </div>
    )
}

ReccomendedChannels.propTypes = {
    channels: PropTypes.arrayOf(
        PropTypes.shape({
            address: PropTypes.string,
            name: PropTypes.string,
        })
    ),
}

ReccomendedChannels.defaultProps = {
    channels: [],
}

export default ReccomendedChannels
