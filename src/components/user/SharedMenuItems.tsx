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

// import { ReactComponent as IndexIcon } from "@/assets/icons/navigation/index.svg"
import { MoonIcon } from "@heroicons/react/solid"
import { ReactComponent as GatewayIcon } from "@/assets/icons/navigation/gateway.svg"
import { ReactComponent as ShortcutsIcon } from "@/assets/icons/shortcuts.svg"

import DarkModeToggle from "./DarkModeToggle"
import DropdownItem from "@/components/common/DropdownItem"
// import IndexExtension from "@/components/env/IndexExtension"
import GatewayExtension from "@/components/env/GatewayExtension"
import { useDarkMode } from "@/state/hooks/env"
import routes from "@/routes"

type SharedMenuItemsProps = {}

const SharedMenuItems: React.FC<SharedMenuItemsProps> = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()

  const handleDarkModeChange = () => {
    toggleDarkMode(!darkMode)
  }

  return (
    <>
      {/* <DropdownItem
        icon={<IndexIcon />}
      >
        <IndexExtension noIcon />
      </DropdownItem> */}
      <DropdownItem
        icon={<GatewayIcon />}
      >
        <GatewayExtension noIcon />
      </DropdownItem>

      <hr />

      <DropdownItem btnAs="div" icon={<MoonIcon />} inactive>
        <DarkModeToggle enabled={darkMode} onChange={handleDarkModeChange} />
      </DropdownItem>
      <DropdownItem href={routes.shortcuts} icon={<ShortcutsIcon />}>
        Shortcuts
      </DropdownItem>
    </>
  )
}

export default SharedMenuItems
