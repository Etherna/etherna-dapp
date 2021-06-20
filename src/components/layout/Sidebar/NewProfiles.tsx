/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useEffect, useState } from "react"

import SidebarItem from "./SidebarItem"
import SidebarItemPlaceholder from "./SidebarItemPlaceholder"
import { IndexUser } from "@classes/EthernaIndexClient/types"
import { Profile } from "@classes/SwarmProfile/types"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import SwarmProfile from "@classes/SwarmProfile"

const NewProfiles = () => {
  const { beeClient, indexClient } = useSelector(state => state.env)
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
      setProfiles([])
    }
  }

  const loadProfiles = async (fetchedProfiles: IndexUser[]) => {
    const promises = fetchedProfiles.map(profile => (new SwarmProfile({
      address: profile.address,
      hash: profile.identityManifest,
      beeClient,
    }).downloadProfile()))
    const profiles = await Promise.all(promises)
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
