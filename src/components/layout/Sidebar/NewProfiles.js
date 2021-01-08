import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import SidebarItemPlaceholder from "./SidebarItemPlaceholder"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import { getProfiles } from "@utils/swarmProfile"
import Routes from "@routes"

const NewProfiles = () => {
  const { indexClient } = useSelector(state => state.env)
  const [profiles, setProfiles] = useState(undefined)

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfiles = async () => {
    try {
      const fetchedProfiles = await indexClient.users.fetchUsers(0, 5)
      setProfiles(fetchedProfiles || [])

      loadProfiles(fetchedProfiles )
    } catch (error) {
      setProfiles([])
      console.error(error)
    }
  }

  /** @param {import("@utils/indexClient/typings").IndexUser[]} fetchedProfiles */
  const loadProfiles = async fetchedProfiles => {
    const profiles = await getProfiles(fetchedProfiles.map(c => {
      return {
        manifest: c.identityManifest,
        address: c.address
      }
    }))
    setProfiles(profiles)
  }

  return (
    <div className="sidenav-menu">
      <h6 className="sidebar-label">New Profiles</h6>
      {profiles === undefined && <SidebarItemPlaceholder />}
      {profiles &&
        profiles.map(profile => (
          <SidebarItem
            image={profile.avatar}
            fallbackAddress={profile.address}
            name={
              checkIsEthAddress(profile.name)
                ? shortenEthAddr(profile.address)
                : profile.name || shortenEthAddr(profile.address)
            }
            link={Routes.getProfileLink(profile.address)}
            key={profile.address}
          />
        ))}
    </div>
  )
}

NewProfiles.propTypes = {
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string,
      name: PropTypes.string,
    })
  ),
}

NewProfiles.defaultProps = {
  profiles: [],
}

export default React.memo(NewProfiles)
