import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import LoginButton from "./LoginButton"
import Avatar from "./Avatar"

import DropDown, { DropDownItem } from "../common/DropDown"

const UserMenu = ({ isLoggedIn, name, image, address, provideConsent, isFetchingThreeBox }) => {
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
                <Avatar image={image && image[0]} address={address} />
            }
        >
            <DropDownItem action={() => {}}>Sign out</DropDownItem>
            <DropDownItem action={() => {}}>Switch Account</DropDownItem>
        </DropDown>
    )
}

UserMenu.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    name: PropTypes.string,
    image: PropTypes.arrayOf(Avatar.propTypes.image),
    address: PropTypes.string,
    provideConsent: PropTypes.bool.isRequired,
    isFetchingThreeBox: PropTypes.bool.isRequired,
}

const mapState = state => {
    return {
        isLoggedIn: state.user.isLoggedIn || false,
        name: state.profile.name,
        image: state.profile.image,
        address: state.user.currentAddress,
        provideConsent: state.ui.provideConsent || false,
        isFetchingThreeBox: state.ui.isFetchingThreeBox || false,
    }
}

export default connect(mapState)(UserMenu)
