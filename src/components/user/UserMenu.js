import React, { useRef } from "react"
import { useSelector } from "react-redux"
import { Link, navigate } from "gatsby"

import SigninButton from "./SigninButton"
import Avatar from "./Avatar"
import EnvDropDownMenus from "./EnvDropDownMenu"
import GuestMenu from "./GuestMenu"
import {
    DropDown,
    DropDownItem,
    DropDownMenu,
    DropDownMenuToggle,
} from "@common/DropDown"
import Image from "@components/common/Image"
import { providerActions } from "@state/actions"
import { shortenEthAddr } from "@utils/ethFuncs"
import * as Routes from "@routes"

const UserMenu = () => {
    const { currentWalletLogo, currentAddress } = useSelector(
        state => state.env
    )
    const { name, avatar } = useSelector(state => state.profile)
    const { isSignedIn, address } = useSelector(state => state.user)

    const hasSwitchedAccount = address !== currentAddress
    let mainMenuRef = useRef()
    let indexMenuRef = useRef()
    let gatewayMenuRef = useRef()

    if (!isSignedIn) {
        return (
            <>
                <GuestMenu />
                <SigninButton>Sign in</SigninButton>
            </>
        )
    }

    const signOut = async () => {
        await providerActions.signout()
        navigate("/")
    }

    return (
        <DropDown>
            <DropDownMenuToggle menuRef={mainMenuRef}>
                <Avatar
                    image={avatar}
                    address={address}
                    showBadge={hasSwitchedAccount}
                />
            </DropDownMenuToggle>

            <DropDownMenu menuRef={mainMenuRef} alignRight={true}>
                <DropDownItem inactive={true}>
                    <Avatar image={avatar} address={address} />
                    <div className="flex flex-col flex-1">
                        <span>{name || shortenEthAddr(address)}</span>
                        {name && (
                            <small className="text-gray-500">
                                {shortenEthAddr(address)}
                            </small>
                        )}
                    </div>
                    <img src={currentWalletLogo} alt="" width="30" />
                </DropDownItem>
                <hr />
                {name && (
                    <DropDownItem>
                        <Link to={Routes.getProfileLink(address)}>
                            <Image filename="profile-icon.svg" />
                            <span>View profile</span>
                        </Link>
                    </DropDownItem>
                )}
                <DropDownItem>
                    <Link to={Routes.getProfileEditingLink(address)}>
                        <Image filename="profile-edit-icon.svg" />
                        <span>{name ? "Edit profile" : "Create profile"}</span>
                    </Link>
                </DropDownItem>
                <hr />
                <DropDownMenuToggle menuRef={indexMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <Image filename="index-icon.svg" />
                        <span>Index</span>
                    </div>
                </DropDownMenuToggle>
                <DropDownMenuToggle menuRef={gatewayMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <Image filename="gateway-icon.svg" />
                        <span>Gateway</span>
                    </div>
                </DropDownMenuToggle>
                <hr />
                <li className="dropdown-footer">
                    {hasSwitchedAccount && (
                        <DropDownItem action={providerActions.switchAccount}>
                            <Image filename="switch-icon.svg" />
                            <div className="inline-flex flex-col">
                                <span>Switch Account</span>
                                <small className="text-gray-600">
                                    {shortenEthAddr(currentAddress)}
                                </small>
                            </div>
                        </DropDownItem>
                    )}
                    <DropDownItem action={signOut}>
                        <Image filename="signout-icon.svg" />
                        <span>Sign out</span>
                    </DropDownItem>
                </li>
            </DropDownMenu>

            <EnvDropDownMenus
                indexMenuRef={indexMenuRef}
                gatewayMenuRef={gatewayMenuRef}
            />
        </DropDown>
    )
}

export default UserMenu
