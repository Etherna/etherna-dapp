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

import React from "react"
import { Link } from "react-router-dom"

import SidebarItem from "./SidebarItem"
import useSelector from "@state/useSelector"
import Routes from "@routes"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"

const MyProfile = () => {
  const { name, avatar } = useSelector(state => state.profile)
  const { isSignedIn, address, identityManifest } = useSelector(state => state.user)

  return (
    <div className="sidenav-menu">
      <h6 className="sidebar-label">My Profile</h6>
      {!isSignedIn && (
        <small className="sidebar-text">Unlock your account</small>
      )}
      {isSignedIn && !identityManifest && (
        <Link to={Routes.getProfileEditingLink(address!)}>
          <small className="sidebar-text">Set up your profile</small>
        </Link>
      )}
      {identityManifest && name && (
        <SidebarItem
          name={checkIsEthAddress(name) ? shortenEthAddr(name) : name || shortenEthAddr(name)}
          image={avatar}
          fallbackAddress={address}
          link={Routes.getProfileLink(address!)}
        />
      )}
    </div>
  )
}

export default MyProfile
