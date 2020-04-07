import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import * as Routes from "@routes"
import { getChannels } from "@utils/ethernaResources/channelResources"
import { getProfiles } from "@utils/3box"
import { getResourceUrl } from "@utils/swarm"

const RecommendedChannels = () => {
    const [channels, setChannels] = useState([])

    useEffect(() => {
        fetchChannels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchChannels = async () => {
        try {
            const fetchedChannels = await getChannels(0, 5)
            const boxProfiles = await getProfiles(
                fetchedChannels.map(p => p.address)
            )
            setChannels(boxProfiles || [])
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="sidenav-menu">
            <h6 className="sidebar-label">Recommended Channels</h6>
            {channels.map(profile => {
                return (
                    <SidebarItem
                        imageUrl={getResourceUrl(profile.avatar)}
                        fallbackAddress={profile.address}
                        name={profile.name}
                        link={Routes.getChannelLink(profile.address)}
                        key={profile.address}
                    />
                )
            })}
        </div>
    )
}

RecommendedChannels.propTypes = {
    profiles: PropTypes.arrayOf(
        PropTypes.shape({
            address: PropTypes.string,
            name: PropTypes.string,
        })
    ),
}

RecommendedChannels.defaultProps = {
    profiles: [],
}

export default RecommendedChannels
