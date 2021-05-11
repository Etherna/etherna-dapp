import React, { useRef } from "react"
import { Link } from "react-router-dom"
import Switch from "react-switch"

import { ReactComponent as EditIcon } from "@svg/icons/edit-icon.svg"
import { ReactComponent as ProfileIcon } from "@svg/icons/profile-icon.svg"
import { ReactComponent as IndexIcon } from "@svg/icons/index-icon.svg"
import { ReactComponent as GatewayIcon } from "@svg/icons/gateway-icon.svg"
import { ReactComponent as SignoutIcon } from "@svg/icons/signout-icon.svg"
import { ReactComponent as DarkModeIcon } from "@svg/icons/dark-mode-icon.svg"
import { ReactComponent as LightModeIcon } from "@svg/icons/light-mode-icon.svg"
import { ReactComponent as ShortcutsIcon } from "@svg/icons/shortcuts-icon.svg"
import { ReactComponent as UploadIcon } from "@svg/icons/upload-icon.svg"

import EnvDropDownMenus from "./EnvDropDownMenu"
import GuestMenu from "./GuestMenu"
import ProfileLoadingPlaceholder from "./ProfileLoadingPlaceholder"
import SigninButton from "./SigninButton"
import Avatar from "../Avatar"
import { DropDown, DropDownItem, DropDownItemContent, DropDownMenu, DropDownMenuToggle } from "@common/DropDown"
import { toggleDarkMode } from "@state/actions/enviroment/darkMode"
import useSelector from "@state/useSelector"
import useSignout from "@state/hooks/user/useSignout"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import Routes from "@routes"

const UserMenu = () => {
  const { currentWalletLogo, darkMode } = useSelector(state => state.env)
  const { name, avatar } = useSelector(state => state.profile)
  const { isSignedIn, isSignedInGateway, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const { signout } = useSignout()

  const mainMenuRef = useRef<HTMLDivElement>(null)
  const indexMenuRef = useRef<HTMLDivElement>(null)
  const gatewayMenuRef = useRef<HTMLDivElement>(null)

  const handleDarkModeChange = () => {
    toggleDarkMode(!darkMode)
  }

  if (isSignedIn === undefined || isSignedInGateway === undefined || isLoadingProfile) {
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
        <Avatar image={avatar} address={address} />
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
            <Link to={Routes.getProfileLink(address!)}>
              <ProfileIcon />
              <span>View profile</span>
            </Link>
          </DropDownItem>
        )}
        <DropDownItem>
          <Link to={Routes.getProfileEditingLink(address!)}>
            <EditIcon />
            <span>Edit profile</span>
          </Link>
        </DropDownItem>
        <DropDownItem>
          <Link to={Routes.getVideoUploadLink()}>
            <UploadIcon />
            <span>Upload a video</span>
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
            <span>Dark Mode</span>
            <Switch
              id="darkMode-field"
              className="ml-auto"
              checkedIcon={<DarkModeIcon className="ml-1.5 p-0.5" />}
              uncheckedIcon={<LightModeIcon className="ml-1.5 p-0.5" />}
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
          <DropDownItem action={signout}>
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
