import React, { useRef } from "react"
import { Link } from "react-router-dom"
import Switch from "react-switch"

import EnvDropDownMenus from "./EnvDropDownMenu"
import { DropDown, DropDownMenu, DropDownMenuToggle, DropDownItem, DropDownItemContent } from "@common/DropDown"
import Button from "@common/Button"
import { ReactComponent as DarkModeIconLg } from "@svg/icons/dark-mode-icon-lg.svg"
import MenuIcon from "@icons/menu/MenuIcon"
import IndexIcon from "@icons/menu/IndexIcon"
import GatewayIcon from "@icons/menu/GatewayIcon"
import ShortcutsIcon from "@icons/menu/ShortcutsIcon"
import DarkModeIcon from "@icons/menu/DarkModeIcon"
import LightModeIcon from "@icons/menu/LightModeIcon"
import { toggleDarkMode } from "@state/actions/enviroment/darkMode"
import useSelector from "@state/useSelector"
import Routes from "@routes"

const GuestMenu = () => {
  const { darkMode } = useSelector(state => state.env)
  const { isSignedIn, isSignedInGateway } = useSelector(state => state.user)
  const mainMenuRef = useRef<HTMLDivElement>(null)
  const indexMenuRef = useRef<HTMLDivElement>(null)
  const gatewayMenuRef = useRef<HTMLDivElement>(null)

  const handleDarkModeChange = () => {
    toggleDarkMode(!darkMode)
  }

  return (
    <DropDown>
      <DropDownMenuToggle menuRef={mainMenuRef}>
        <Button aspect="transparent" className="btn-rounded mr-2">
          <MenuIcon />
        </Button>
      </DropDownMenuToggle>
      <DropDownMenu menuRef={mainMenuRef} alignRight={true}>
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
            <DarkModeIconLg />
            <span>Dark Mode</span>
            <Switch
              id="darkMode-field"
              className="ml-auto"
              checkedIcon={<DarkModeIcon className="m-0.5 ml-1" color="#fff" />}
              uncheckedIcon={<LightModeIcon className="m-0.5 ml-1" color="#333" />}
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
      </DropDownMenu>
      <EnvDropDownMenus indexMenuRef={indexMenuRef} gatewayMenuRef={gatewayMenuRef} />
    </DropDown>
  )
}

export default GuestMenu
