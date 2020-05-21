import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import SidebarItemPlaceholder from "./SidebarItemPlaceholder"
import Routes from "@routes"
import { getChannels } from "@utils/ethernaResources/channelResources"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import { getProfiles } from "@utils/swarmProfile"
import { getResourceUrl } from "@utils/swarm"

const NewChannels = () => {
    const [channels, setChannels] = useState(undefined)

    useEffect(() => {
        fetchChannels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchChannels = async () => {
        try {
            const fetchedChannels = await getChannels(0, 5)
            setChannels(fetchedChannels || [])

            loadProfiles(fetchedChannels)
        } catch (error) {
            setChannels([])
            console.error(error)
        }
    }

    const loadProfiles = async (fetchedChannels) => {
        const profiles = await getProfiles(
            fetchedChannels.map(c => c.address)
        )
        setChannels(profiles)
    }

    return (
        <div className="sidenav-menu">
            <h6 className="sidebar-label">New Channels</h6>
            {channels === undefined && (
                <SidebarItemPlaceholder />
            )}
            {channels && channels.map(channel => {
                return (
                    <SidebarItem
                        imageUrl={getResourceUrl(channel.avatar)}
                        fallbackAddress={channel.address}
                        name={
                            checkIsEthAddress(channel.name)
                                ? shortenEthAddr(channel.address)
                                : channel.name || shortenEthAddr(channel.address)
                        }
                        link={Routes.getChannelLink(channel.address)}
                        key={channel.address}
                    />
                )
            })}
        </div>
    )
}

NewChannels.propTypes = {
    profiles: PropTypes.arrayOf(
        PropTypes.shape({
            address: PropTypes.string,
            name: PropTypes.string,
        })
    ),
}

NewChannels.defaultProps = {
    profiles: [],
}

export default React.memo(NewChannels)
