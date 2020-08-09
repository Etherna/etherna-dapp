import React from "react"
import { Link } from "react-router-dom"

import SidebarItem from "./SidebarItem"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import useSelector from "@state/useSelector"
import Routes from "@routes"

const MyChannel = () => {
  const { name, avatar, existsOnIndex } = useSelector(state => state.profile)
  const { isSignedIn, address } = useSelector(state => state.user)
  const hasProfile = isSignedIn && name && name !== ""

  return (
    <div className="sidenav-menu">
      <h6 className="sidebar-label">{existsOnIndex ? "My Channel" : "My Profile"}</h6>
      {!isSignedIn && (
        <small className="sidebar-text">Unlock your account</small>
      )}
      {isSignedIn && !hasProfile && (
        <Link to={Routes.getChannelEditingLink(address)}>
          <small className="sidebar-text">Set up your profile</small>
        </Link>
      )}
      {hasProfile && (
        <SidebarItem
          name={checkIsEthAddress(name) ? shortenEthAddr(name) : name || shortenEthAddr(name)}
          image={avatar}
          fallbackAddress={address}
          link={Routes.getChannelLink(address)}
        />
      )}
    </div>
  )
}

export default MyChannel
