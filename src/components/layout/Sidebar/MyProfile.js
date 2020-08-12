import React from "react"
import { Link } from "react-router-dom"

import SidebarItem from "./SidebarItem"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import useSelector from "@state/useSelector"
import Routes from "@routes"

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
        <Link to={Routes.getProfileEditingLink(address)}>
          <small className="sidebar-text">Set up your profile</small>
        </Link>
      )}
      {identityManifest && name && (
        <SidebarItem
          name={checkIsEthAddress(name) ? shortenEthAddr(name) : name || shortenEthAddr(name)}
          image={avatar}
          fallbackAddress={address}
          link={Routes.getProfileLink(address)}
        />
      )}
    </div>
  )
}

export default MyProfile
