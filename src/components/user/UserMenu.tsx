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

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"

import SharedMenuItems from "./SharedMenuItems"
import SignedInMenuItems from "./SignedInMenuItems"
import SigninButton from "./SigninButton"
import { Button, Dropdown } from "@/components/ui/actions"
import { Avatar, Skeleton } from "@/components/ui/display"
import useSignout from "@/state/hooks/user/useSignout"
import useSelector from "@/state/useSelector"

const UserMenu: React.FC = () => {
  const { avatar } = useSelector(state => state.profile)
  const { isSignedIn, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const { signout } = useSignout()

  const isSigningIn = isSignedIn === undefined || isLoadingProfile
  const isFullySignedIn = isSignedIn === true

  if (isSigningIn) {
    return (
      <Skeleton roundedFull>
        <div className="h-9 w-9" />
      </Skeleton>
    )
  }

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle>
          <Button as="div" color="inverted" aspect="text" rounded>
            {isFullySignedIn ? (
              <Avatar image={avatar} address={address} size={36} />
            ) : (
              <EllipsisVerticalIcon width={20} aria-hidden />
            )}
          </Button>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <>
            {isFullySignedIn && <SignedInMenuItems />}

            <SharedMenuItems />

            {isFullySignedIn && (
              <>
                <Dropdown.Separator />
                <Dropdown.Group>
                  <Dropdown.Item
                    action={signout}
                    icon={<ArrowRightOnRectangleIcon strokeWidth={2} />}
                  >
                    Sign out
                  </Dropdown.Item>
                </Dropdown.Group>
              </>
            )}
          </>
        </Dropdown.Menu>
      </Dropdown>

      {!isFullySignedIn && <SigninButton>Sign in</SigninButton>}
    </>
  )
}

export default UserMenu
