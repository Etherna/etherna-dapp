import React, { useState } from "react"
import PropTypes from "prop-types"
import { Redirect } from "react-router-dom"

import "./channel-editor.scss"
import ProfileInfoEdit from "@components/profile/ProfileInfoEdit"
import { profileActions } from "@state/actions"
import { showError } from "@state/actions/modals"
import Routes from "@routes"

const ChannelEditor = ({ address }) => {
    const [isSavingChannel, setSavingChannel] = useState(false)
    const [savedProfile, setSavedProfile] = useState(false)

    const handleSubmit = async profileInfo => {
        setSavingChannel(true)

        try {
            await profileActions.updateProfile(profileInfo)
            setSavedProfile(true)
        } catch (error) {
            console.error(error)
            showError("Cannot save profile", error.message)
        }

        setSavingChannel(false)
    }

    if (savedProfile) {
        return <Redirect to={Routes.getChannelLink(address)} />
    }

    return (
        <ProfileInfoEdit
            profileAddress={address}
            isSubmitting={isSavingChannel}
            onSubmit={handleSubmit}
        />
    )
}

ChannelEditor.propTypes = {
    address: PropTypes.string.isRequired,
}

export default ChannelEditor
