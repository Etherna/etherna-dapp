import React from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import * as Routes from "@routes"

const ReccomendedProfiles = ({ profiles }) => {
    return (
        <div className="sidenav-menu">
            <h6 className="sidebar-label">Reccomended Profiles</h6>
            {profiles.map(profile => {
                return (
                    <SidebarItem
                        imageUrl={profile.imageUrl}
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
