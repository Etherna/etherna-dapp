import React, { useState } from "react"

import { ReactComponent as SignoutIcon } from "@svg/icons/signout-icon.svg"
import { ReactComponent as MoreIcon } from "@svg/icons/more-icon.svg"

import SigninButton from "./SigninButton"
import SharedMenuItems from "./SharedMenuItems"
import SignedInMenuItems from "./SignedInMenuItems"
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@common/Dropdown"
import Placeholder from "@common/Placeholder"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import useSignout from "@state/hooks/user/useSignout"

const UserMenu: React.FC = () => {
  const { avatar } = useSelector(state => state.profile)
  const { isSignedIn, isSignedInGateway, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const { signout } = useSignout()

  const isSigningIn = isSignedIn === undefined || isSignedInGateway === undefined || isLoadingProfile

  if (isSigningIn) {
    return (
      <Placeholder width="2.5rem" height="2.5rem" round="full" />
    )
  }

  return (
    <>
      <Dropdown>
        <DropdownToggle className="btn btn-rounded btn-transparent">
          {isSignedIn === false ? (
            <MoreIcon />
          ) : (
            <Avatar image={avatar} address={address} />
          )}
        </DropdownToggle>

        <DropdownMenu>
          <>
            {isSignedIn === true && (
              <SignedInMenuItems />
            )}

            <SharedMenuItems />

            {isSignedIn === true && (
              <>
                <hr />
                <DropdownItem action={signout} icon={<SignoutIcon />}>
                  Sign out
                </DropdownItem>
              </>
            )}
          </>
        </DropdownMenu>
      </Dropdown>

      {isSignedIn === false && (
        <SigninButton>Sign in</SigninButton>
      )}
    </>
  )
}

export default UserMenu
