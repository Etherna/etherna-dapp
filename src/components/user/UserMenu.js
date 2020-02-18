import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link } from "gatsby"

import LoginButton from "./LoginButton"
import Avatar from "./Avatar"

import DropDown, { DropDownItem } from "../common/DropDown"

const UserMenu = ({
    isLoggedIn,
    name,
    avatar,
    address,
    provideConsent,
    isFetchingThreeBox,
}) => {
    if (provideConsent) {
        return <small>Syncing...</small>
    }

    if (isFetchingThreeBox) {
        return <small>Loading profile...</small>
    }

    if (!isLoggedIn) {
        return <LoginButton>Login</LoginButton>
    }

    return (
        <DropDown
            alignRight={true}
            toggleChildren={
                <Avatar image={avatar} address={address} />
            }
        >
            <DropDownItem action={() => {}}>
                <Link to={`/channel/${address}/edit`}>Edit your channel</Link>
            </DropDownItem>
            <DropDownItem action={() => {}}>Sign out</DropDownItem>
            <DropDownItem action={() => {}}>Switch Account</DropDownItem>
        </DropDown>
    )
}

UserMenu.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.arrayOf(Avatar.propTypes.image),
    address: PropTypes.string,
    provideConsent: PropTypes.bool.isRequired,
    isFetchingThreeBox: PropTypes.bool.isRequired,
}

const mapState = state => {
    return {
        isLoggedIn: state.user.isLoggedIn || false,
        name: state.channel.channelName,
        avatar: state.channel.channelAvatar,
        address: state.user.currentAddress,
        provideConsent: state.ui.provideConsent || false,
        isFetchingThreeBox: state.ui.isFetchingThreeBox || false,
    }
}

export default connect(mapState)(UserMenu)
