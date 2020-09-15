import React, { useRef } from "react"
import { Link } from "react-router-dom"
import Switch from "react-switch"

import Avatar from "./Avatar"
import EnvDropDownMenus from "./EnvDropDownMenu"
import GuestMenu from "./GuestMenu"
import ProfileLoadingPlaceholder from "./ProfileLoadingPlaceholder"
import SigninButton from "./SigninButton"
import { DropDown, DropDownItem, DropDownItemContent, DropDownMenu, DropDownMenuToggle } from "@common/DropDown"
import EditProfileIcon from "@icons/menu/EditProfileIcon"
import ProfileIcon from "@icons/menu/ProfileIcon"
import IndexIcon from "@icons/menu/IndexIcon"
import GatewayIcon from "@icons/menu/GatewayIcon"
import SwitchIcon from "@icons/menu/SwitchIcon"
import SignoutIcon from "@icons/menu/SignoutIcon"
import DarkModeIcon from "@icons/menu/DarkModeIcon"
import LightModeIcon from "@icons/menu/LightModeIcon"
import ShortcutsIcon from "@icons/menu/ShortcutsIcon"
import { toggleDarkMode } from "@state/actions/enviroment/darkMode"
import { providerActions } from "@state/actions"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import Routes from "@routes"

const UserMenu = () => {
  const { currentWalletLogo, currentAddress, darkMode } = useSelector(state => state.env)
  const { name, avatar } = useSelector(state => state.profile)
  const { isSignedIn, isSignedInGateway, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)

  const hasSwitchedAccount = currentAddress && address !== currentAddress

  const mainMenuRef = useRef()
  const indexMenuRef = useRef()
  const gatewayMenuRef = useRef()

  const signOut = async () => {
    await providerActions.signout()
  }

  const handleDarkModeChange = () => {
    toggleDarkMode(!darkMode)
  }

  if (isSignedIn === undefined || isLoadingProfile) {
    return (
      <>
        <GuestMenu />
        <ProfileLoadingPlaceholder />
      </>
    )
  }

  if (isSignedIn === false) {
    return (
      <>
        <GuestMenu />
        <SigninButton>Sign in</SigninButton>
      </>
    )
  }

  return (
    <DropDown>
      <DropDownMenuToggle menuRef={mainMenuRef}>
        <Avatar image={avatar} address={address} showBadge={hasSwitchedAccount} />
      </DropDownMenuToggle>

      <DropDownMenu menuRef={mainMenuRef} alignRight={true}>
        <DropDownItem inactive={true}>
          <Avatar image={avatar} address={address} />
          <div className="flex flex-col flex-1">
            <span>
              {checkIsEthAddress(name) ? shortenEthAddr(name) : name || shortenEthAddr(address)}
            </span>
            {name && (
              <small className="text-gray-500">{shortenEthAddr(address)}</small>
            )}
          </div>
          <img src={currentWalletLogo} alt="" width="30" />
        </DropDownItem>
        <hr />
        {name && (
          <DropDownItem>
            <Link to={Routes.getProfileLink(address)}>
              <ProfileIcon />
              <span>View profile</span>
            </Link>
          </DropDownItem>
        )}
        <DropDownItem>
          <Link to={Routes.getProfileEditingLink(address)}>
            <EditProfileIcon />
            <span>Edit profile</span>
          </Link>
        </DropDownItem>
        <hr />
        <DropDownMenuToggle menuRef={indexMenuRef} isMenuItem={true}>
          <DropDownItemContent icon={<IndexIcon />} status={isSignedIn ? "active" : "inactive"}>
            Index
          </DropDownItemContent>
        </DropDownMenuToggle>
        <DropDownMenuToggle menuRef={gatewayMenuRef} isMenuItem={true}>
          <DropDownItemContent icon={<GatewayIcon />} status={isSignedInGateway ? "active" : "inactive"}>
            Gateway
          </DropDownItemContent>
        </DropDownMenuToggle>

        <hr />

        <DropDownItem>
          <div className="flex w-full">
            <DarkModeIcon />
            <span htmlFor="darkMode-field">Dark Mode</span>
            <Switch
              id="darkMode-field"
              className="ml-auto"
              checkedIcon={<DarkModeIcon className="mx-1" color="#fff" />}
              uncheckedIcon={<LightModeIcon className="mx-1" color="#333" />}
              height={24}
              width={50}
              handleDiameter={20}
              offColor={darkMode ? "#333" : "#ccc"}
              onColor="#34BA9C"
              checked={darkMode}
              onChange={handleDarkModeChange}
            />
          </div>
        </DropDownItem>
        <DropDownItem>
          <Link to={Routes.getShortcutsLink()}>
            <ShortcutsIcon />
            <span>Shortcuts</span>
          </Link>
        </DropDownItem>

        <hr />

        <li className="dropdown-footer">
          {hasSwitchedAccount && (
            <DropDownItem action={providerActions.switchAccount}>
              <SwitchIcon />
              <div className="inline-flex flex-col">
                <span>Switch Account</span>
                <small className="text-gray-600">{shortenEthAddr(currentAddress)}</small>
              </div>
            </DropDownItem>
          )}
          <DropDownItem action={signOut}>
            <SignoutIcon />
            <span>Sign out</span>
          </DropDownItem>
        </li>
      </DropDownMenu>

      <EnvDropDownMenus indexMenuRef={indexMenuRef} gatewayMenuRef={gatewayMenuRef} />
    </DropDown>
  )
}

export default UserMenu
