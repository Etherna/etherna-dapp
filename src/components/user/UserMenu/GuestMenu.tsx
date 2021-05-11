import React, { useRef } from "react"
import { Link } from "react-router-dom"
import Switch from "react-switch"

import { ReactComponent as MoreIcon } from "@svg/icons/more-icon.svg"
import { ReactComponent as IndexIcon } from "@svg/icons/index-icon.svg"
import { ReactComponent as GatewayIcon } from "@svg/icons/gateway-icon.svg"
import { ReactComponent as ShortcutsIcon } from "@svg/icons/shortcuts-icon.svg"
import { ReactComponent as DarkModeIcon } from "@svg/icons/dark-mode-icon.svg"
import { ReactComponent as LightModeIcon } from "@svg/icons/light-mode-icon.svg"

import EnvDropDownMenus from "./EnvDropDownMenu"
import { DropDown, DropDownMenu, DropDownMenuToggle, DropDownItem, DropDownItemContent } from "@common/DropDown"
import Button from "@common/Button"
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
          <MoreIcon />
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
          <div className="flex w-full items-center">
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
      </DropDownMenu>
      <EnvDropDownMenus indexMenuRef={indexMenuRef} gatewayMenuRef={gatewayMenuRef} />
    </DropDown>
  )
}

export default GuestMenu
