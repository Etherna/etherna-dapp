import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import * as Routes from "@routes"
import { getChannels } from "@utils/ethernaResources/channelResources"
import { getProfiles } from "@utils/3box"
import { getResourceUrl } from "@utils/swarm"

const ReccomendedProfiles = () => {
    const [profiles, setProfiles] = useState([])

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const fetchedProfiles = await getChannels(0, 5)
                const boxProfiles = await getProfiles(
                    fetchedProfiles.map(p => p.address)
                )
                setProfiles(boxProfiles || [])
            } catch (error) {
                console.error(error)
            }
        }
        fetchProfiles()
    }, [])

    return (
        <div className="sidenav-menu">
            <h6 className="sidebar-label">Reccomended Profiles</h6>
            {profiles.map(profile => {
                return (
                    <SidebarItem
                        imageUrl={getResourceUrl(profile.avatar)}
                        fallbackAddress={profile.address}
                        name={profile.name}
                        link={Routes.getProfileLink(profile.address)}
                        key={profile.address}
                    />
                )
            })}
        </div>
    )
}

ReccomendedProfiles.propTypes = {
    profiles: PropTypes.arrayOf(
        PropTypes.shape({
            address: PropTypes.string,
            name: PropTypes.string,
        })
    ),
}

ReccomendedProfiles.defaultProps = {
    profiles: [],
}

export default ReccomendedProfiles
