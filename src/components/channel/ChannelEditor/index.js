import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Redirect } from "react-router-dom"
import { useSelector } from "react-redux"

import "./channel-editor.scss"
import ProfileInfoEdit from "@components/profile/ProfileInfoEdit"
import { profileActions } from "@state/actions"
import Routes from "@routes"

const ChannelEditor = ({ address }) => {
    const { box } = useSelector(state => state.user)

    const [isSavingChannel, setSavingChannel] = useState(false)
    const [savedProfile, setSavedProfile] = useState(false)

    useEffect(() => {
        if (!box) {
            profileActions.openBox()
        }
    }, [box])

    const handleSubmit = async profileInfo => {
        setSavingChannel(true)

        const savedProfile = await profileActions.updateProfile(
            box,
            profileInfo
        )

        setSavedProfile(savedProfile)

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
