import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { navigate } from "gatsby"

import "./channel-editor.scss"
import ProfileInfoEdit from "components/profile/ProfileInfoEdit"
import { profileActions } from "state/actions"
import * as Routes from "routes"

const ChannelEditor = ({ address }) => {
    const { box } = useSelector(state => state.user)

    const [isSavingChannel, setSavingChannel] = useState(false)

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

        if (savedProfile) {
            navigate(Routes.getChannelLink(address))
        }

        setSavingChannel(false)
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
