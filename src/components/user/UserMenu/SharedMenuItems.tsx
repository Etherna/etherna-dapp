import React from "react"

import { ReactComponent as IndexIcon } from "@svg/icons/navigation/index.svg"
import { ReactComponent as GatewayIcon } from "@svg/icons/navigation/gateway.svg"
import { ReactComponent as ShortcutsIcon } from "@svg/icons/shortcuts-icon.svg"
import { ReactComponent as DarkModeIcon } from "@svg/icons/dark-mode-icon.svg"

import DarkModeToggle from "./DarkModeToggle"
import { DropdownItem } from "@common/Dropdown"
import IndexExtension from "@components/env/IndexExtension"
import GatewayExtension from "@components/env/GatewayExtension"
import routes from "@routes"
import { toggleDarkMode } from "@state/actions/enviroment/darkMode"
import useSelector from "@state/useSelector"

type SharedMenuItemsProps = {}

const SharedMenuItems: React.FC<SharedMenuItemsProps> = () => {
  const darkMode = useSelector(state => state.env.darkMode)

  const handleDarkModeChange = () => {
    toggleDarkMode(!darkMode)
  }

  return (
    <>
      <DropdownItem
        icon={<IndexIcon />}
      >
        <IndexExtension noIcon />
      </DropdownItem>
      <DropdownItem
        icon={<GatewayIcon />}
      >
        <GatewayExtension noIcon />
      </DropdownItem>

      <hr />

      <DropdownItem btnAs="div" icon={<DarkModeIcon />} inactive>
        <DarkModeToggle enabled={darkMode} onChange={handleDarkModeChange} />
      </DropdownItem>
      <DropdownItem href={routes.getShortcutsLink()} icon={<ShortcutsIcon />}>
        Shortcuts
      </DropdownItem>
    </>
  )
}

export default SharedMenuItems
