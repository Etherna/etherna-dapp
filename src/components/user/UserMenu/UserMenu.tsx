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

import React, { useState } from "react"

import { ReactComponent as SignoutIcon } from "@svg/icons/signout-icon.svg"
import { ReactComponent as MoreIcon } from "@svg/icons/more-icon.svg"

import SigninButton from "./SigninButton"
import SharedMenuItems from "./SharedMenuItems"
import SignedInMenuItems from "./SignedInMenuItems"
import ExtensionPanelMenuItems, { PanelType } from "./ExtensionPanelMenuItems"
import Avatar from "../Avatar"
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@common/Dropdown"
import Placeholder from "@common/Placeholder"
import useSelector from "@state/useSelector"
import useSignout from "@state/hooks/user/useSignout"

const UserMenu: React.FC = () => {
  const { avatar } = useSelector(state => state.profile)
  const { isSignedIn, isSignedInGateway, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const { signout } = useSignout()

  const [selectedPanel, setSelectedPanel] = useState<PanelType | null>()

  const isSigningIn = isSignedIn === undefined || isSignedInGateway === undefined || isLoadingProfile

  const handlePanelBack = () => {
    setSelectedPanel(null)
    setTimeout(() => {
      setSelectedPanel(undefined)
    }, 1000)
  }

  if (isSigningIn) {
    return (
      <Placeholder width="2.5rem" height="2.5rem" round="full" />
    )
  }

  return (
    <>
      <Dropdown forceOpen={selectedPanel !== undefined}>
        <DropdownToggle className="btn btn-rounded btn-transparent mr-2">
          {isSignedIn === false ? (
            <MoreIcon />
          ) : (
            <Avatar image={avatar} address={address} />
          )}
        </DropdownToggle>

        <DropdownMenu>
          {selectedPanel ? (
            <ExtensionPanelMenuItems panel={selectedPanel} onBack={handlePanelBack} />
          ) : (
            <>
              {isSignedIn === true && (
                <SignedInMenuItems />
              )}

              <SharedMenuItems onPanelSelect={setSelectedPanel} />

              {isSignedIn === true && (
                <>
                  <hr />
                  <DropdownItem action={signout} icon={<SignoutIcon />}>
                    Sign out
                  </DropdownItem>
                </>
              )}
            </>
          )}
        </DropdownMenu>
      </Dropdown>

      {isSignedIn === false && (
        <SigninButton>Sign in</SigninButton>
      )}
    </>
  )
}

export default UserMenu
