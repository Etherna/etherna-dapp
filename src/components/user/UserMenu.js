import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link } from "gatsby"

import LoginButton from "./LoginButton"
import Avatar from "./Avatar"
import DropDown, { DropDownItem } from "@common/DropDown"
import * as Routes from "@routes"
import actions from "../../state/actions"

import { useStateValue } from "@context/store"

const { checkMobileWeb3, checkNetwork } = actions.enviroment
const { openBox, handleSignOut, injectWeb3 } = actions.login

const UserMenu = ({
    isLoggedIn,
    avatar,
    address,
    box,

    openBox,
    handleSignOut,
    injectWeb3,
    checkMobileWeb3,
    checkNetwork,
}) => {
    if (!isLoggedIn) {
        return <LoginButton>Login</LoginButton>
    }

    const signOut = () => {
        if (box.logout) handleSignOut()
    }

    const switchAccount = async () => {
        try {
            await checkMobileWeb3()
            await injectWeb3(null, true, false, true)
            await checkNetwork()
            await openBox()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <DropDown
            alignRight={true}
            toggleChildren={<Avatar image={avatar} address={address} />}
        >
            <DropDownItem>
                <Link to={Routes.getChannelEditingLink(address)}>
                    Edit your channel
                </Link>
            </DropDownItem>
            <DropDownItem action={switchAccount}>Switch Account</DropDownItem>
            <DropDownItem action={signOut}>Sign out</DropDownItem>
        </DropDown>
    )
}

UserMenu.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    avatar: PropTypes.arrayOf(Avatar.propTypes.image),
    address: PropTypes.string,
    box: PropTypes.object,
    openBox: PropTypes.func.isRequired,
    handleSignOut: PropTypes.func.isRequired,
    injectWeb3: PropTypes.func.isRequired,
    checkMobileWeb3: PropTypes.func.isRequired,
    checkNetwork: PropTypes.func.isRequired,
}

const mapState = state => {
    return {
        isLoggedIn: state.user.isLoggedIn || false,
        avatar: state.channel.channelAvatar,
        address: state.user.currentAddress,
        box: state.user.box,
    }
}

export default connect(mapState, {
    openBox,
    handleSignOut,
    injectWeb3,
    checkMobileWeb3,
    checkNetwork,
})(UserMenu)
