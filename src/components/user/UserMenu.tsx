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
import { useAuth } from "react-oidc-context"

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"

import SharedMenuItems from "./SharedMenuItems"
import SignedInMenuItems from "./SignedInMenuItems"
import SigninButton from "./SigninButton"
import { Button, Dropdown } from "@/components/ui/actions"
import { Avatar, Skeleton } from "@/components/ui/display"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"

const UserMenu: React.FC = () => {
  const { isAuthenticated, isLoading, signoutRedirect } = useAuth()
  const avatar = useUserStore(state => state.profile?.avatar)
  const address = useUserStore(state => state.address)
  const isLoadingProfile = useUIStore(state => state.isLoadingProfile)
  const signout = useUserStore(state => state.signout)

  const isSigningIn = isLoading || isLoadingProfile

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
            {isAuthenticated ? (
              <Avatar image={avatar} address={address} size={36} />
            ) : (
              <EllipsisVerticalIcon width={20} aria-hidden />
            )}
          </Button>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <>
            {isAuthenticated && <SignedInMenuItems />}

            <SharedMenuItems />

            {isAuthenticated && (
              <>
                <Dropdown.Separator />
                <Dropdown.Group>
                  <Dropdown.Item
                    action={() => {
                      signout()
                      setTimeout(() => {
                        signoutRedirect()
                      }, 100)
                    }}
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

      {!isAuthenticated && <SigninButton>Sign in</SigninButton>}
    </>
  )
}

export default UserMenu
