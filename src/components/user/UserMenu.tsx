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

import { LogoutIcon } from "@heroicons/react/outline"
import { DotsVerticalIcon } from "@heroicons/react/solid"

import SharedMenuItems from "./SharedMenuItems"
import SignedInMenuItems from "./SignedInMenuItems"
import AlphaPassButton from "./AlphaPassButton"
// import SigninButton from "./SigninButton"
import Avatar from "./Avatar"
import Button from "@common/Button"
import Dropdown from "@common/Dropdown"
import DropdownItem from "@common/DropdownItem"
import DropdownMenu from "@common/DropdownMenu"
import DropdownToggle from "@common/DropdownToggle"
import Placeholder from "@common/Placeholder"
import useSelector from "@state/useSelector"
import useSignout from "@state/hooks/user/useSignout"

const UserMenu: React.FC = () => {
  const { avatar } = useSelector(state => state.profile)
  const { isSignedIn, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const { signout } = useSignout()

  const isSigningIn = isSignedIn === undefined || isLoadingProfile
  const isFullySignedIn = isSignedIn === true

  if (isSigningIn) {
    return (
      <Placeholder width="2.25rem" height="2.25rem" round="full" />
    )
  }

  return (
    <>
      <Dropdown>
        <DropdownToggle>
          <Button as="div" modifier="transparent" rounded iconOnly>
            {isFullySignedIn ? (
              <Avatar image={avatar} address={address} size={36} />
            ) : (
              <DotsVerticalIcon />
            )}
          </Button>
        </DropdownToggle>

        <DropdownMenu>
          <>
            {isFullySignedIn && (
              <SignedInMenuItems />
            )}

            <SharedMenuItems />

            {isFullySignedIn && (
              <>
                <hr />
                <DropdownItem action={signout} icon={<LogoutIcon />}>
                  Sign out
                </DropdownItem>
              </>
            )}
          </>
        </DropdownMenu>
      </Dropdown>

      {!isFullySignedIn && (
        // <SigninButton>Sign in</SigninButton>
        <AlphaPassButton>Request invitation</AlphaPassButton>
      )}
    </>
  )
}

export default UserMenu
