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
