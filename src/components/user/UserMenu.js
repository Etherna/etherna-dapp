import React from "react"
import { useSelector } from "react-redux"
import { Link, navigate } from "gatsby"

import SigninButton from "./SigninButton"
import Avatar from "./Avatar"
import DropDown, { DropDownItem } from "@common/DropDown"
import { providerActions } from "@state/actions"
import * as Routes from "@routes"

const UserMenu = () => {
    const { avatar } = useSelector(state => state.profile)
    const { isSignedIn, address } = useSelector(state => state.user)

    if (!isSignedIn) {
        return <SigninButton>Login</SigninButton>
    }

    const signOut = async () => {
        await providerActions.signout()
        navigate("/")
    }

    return (
        <DropDown
            alignRight={true}
            toggleChildren={<Avatar image={avatar} address={address} />}
        >
            <DropDownItem>
                <Link to={Routes.getProfileEditingLink(address)}>
                    Edit your profile
                </Link>
            </DropDownItem>
            <DropDownItem action={providerActions.switchAccount}>Switch Account</DropDownItem>
            <DropDownItem action={signOut}>Sign out</DropDownItem>
        </DropDown>
    )
}

export default UserMenu
