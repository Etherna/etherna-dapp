import React, { useEffect, useState } from "react"

import SidebarItem from "./SidebarItem"
import SidebarItemPlaceholder from "./SidebarItemPlaceholder"
import useSelector from "@state/useSelector"
import Routes from "@routes"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import { getProfiles, Profile } from "@utils/swarmProfile"
import { IndexUser } from "@utils/indexClient/typings"

const NewProfiles = () => {
  const { indexClient } = useSelector(state => state.env)
  const [profiles, setProfiles] = useState<Profile[]>()

  useEffect(() => {
    fetchProfiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfiles = async () => {
    try {
      const fetchedProfiles = await indexClient.users.fetchUsers(0, 5)
      loadProfiles(fetchedProfiles)
    } catch (error) {
      console.error(error)
    }
  }

  const loadProfiles = async (fetchedProfiles: IndexUser[]) => {
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

export default React.memo(NewProfiles)
