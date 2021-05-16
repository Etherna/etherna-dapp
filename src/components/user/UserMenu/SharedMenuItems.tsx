import React from "react"

import { ReactComponent as IndexIcon } from "@svg/icons/index-icon.svg"
import { ReactComponent as GatewayIcon } from "@svg/icons/gateway-icon.svg"
import { ReactComponent as ShortcutsIcon } from "@svg/icons/shortcuts-icon.svg"
import { ReactComponent as DarkModeIcon } from "@svg/icons/dark-mode-icon.svg"

import ExtensionPanelSuffix from "./ExtensionPanelSuffix"
import { PanelType } from "./ExtensionPanelMenuItems"
import DarkModeToggle from "./DarkModeToggle"
import { DropdownItem } from "@common/Dropdown"
import routes from "@routes"
import { toggleDarkMode } from "@state/actions/enviroment/darkMode"
import useSelector from "@state/useSelector"

type SharedMenuItemsProps = {
  onPanelSelect(panel: PanelType): void
}

const SharedMenuItems: React.FC<SharedMenuItemsProps> = ({ onPanelSelect }) => {
  const darkMode = useSelector(state => state.env.darkMode)
  const { isSignedIn, isSignedInGateway } = useSelector(state => state.user)

  const handleDarkModeChange = () => {
    toggleDarkMode(!darkMode)
  }

  return (
    <>
      <DropdownItem
        action={() => onPanelSelect("index")}
        icon={<IndexIcon />}
        suffix={<ExtensionPanelSuffix active={isSignedIn === true} />}
      >
        Index
      </DropdownItem>
      <DropdownItem
        action={() => onPanelSelect("gateway")}
        icon={<GatewayIcon />}
        suffix={<ExtensionPanelSuffix active={isSignedInGateway === true} />}
      >
        Gateway
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
