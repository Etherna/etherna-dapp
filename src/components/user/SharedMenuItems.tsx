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

import React, { useCallback } from "react"
import { useAuth } from "react-oidc-context"

// import { ReactComponent as IndexIcon } from "@/assets/icons/navigation/index.svg"
import { BanknotesIcon, MoonIcon, ShieldCheckIcon } from "@heroicons/react/24/solid"
import { ReactComponent as GatewayIcon } from "@/assets/icons/navigation/gateway.svg"
import { ReactComponent as ShortcutsIcon } from "@/assets/icons/shortcuts.svg"

import DarkModeToggle from "./DarkModeToggle"
// import IndexExtension from "@/components/env/IndexExtension"
import GatewayExtension from "@/components/env/GatewayExtension"
import { Dropdown } from "@/components/ui/actions"
import useDarkMode from "@/hooks/useDarkMode"
import routes from "@/routes"

type SharedMenuItemsProps = {}

const SharedMenuItems: React.FC<SharedMenuItemsProps> = () => {
  const { isAuthenticated } = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()

  const handleDarkModeChange = useCallback(() => {
    toggleDarkMode(!darkMode)
  }, [darkMode, toggleDarkMode])

  return (
    <>
      {!isAuthenticated && (
        <>
          <Dropdown.Group>
            <Dropdown.Item href={routes.alphaPasss} icon={<ShieldCheckIcon />}>
              Request Alpha Pass
            </Dropdown.Item>
          </Dropdown.Group>
          <Dropdown.Separator />
        </>
      )}

      <Dropdown.Group>
        {/* <Dropdown.Item
        icon={<IndexIcon />}
      >
        <IndexExtension noIcon />
      </Dropdown.Item> */}
        <Dropdown.Item icon={<GatewayIcon />}>
          <GatewayExtension noIcon />
        </Dropdown.Item>
        <Dropdown.Item href={routes.postages} icon={<BanknotesIcon />}>
          Postages
        </Dropdown.Item>
      </Dropdown.Group>

      <Dropdown.Separator />

      <Dropdown.Group>
        <Dropdown.Item btnAs="div" icon={<MoonIcon />} inactive>
          <DarkModeToggle enabled={darkMode} onChange={handleDarkModeChange} />
        </Dropdown.Item>
        <Dropdown.Item href={routes.shortcuts} icon={<ShortcutsIcon />}>
          Shortcuts
        </Dropdown.Item>
      </Dropdown.Group>
    </>
  )
}

export default SharedMenuItems
