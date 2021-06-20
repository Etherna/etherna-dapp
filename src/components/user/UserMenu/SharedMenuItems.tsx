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
