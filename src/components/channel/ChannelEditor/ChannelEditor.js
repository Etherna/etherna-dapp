import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Redirect } from "react-router-dom"

import "./channel-editor.scss"
import ProfileInfoEdit from "@components/profile/ProfileInfoEdit"
import { profileActions, providerActions } from "@state/actions"
import { showError } from "@state/actions/modals"
import { getIdentity } from "@utils/ethernaResources/identityResources"
import Routes from "@routes"

const ChannelEditor = ({ address }) => {
    const [isSavingChannel, setSavingChannel] = useState(false)
    const [savedProfile, setSavedProfile] = useState(false)

    useEffect(() => {
        loadWallet()

        /**
         * Remove the wallet from store when component is unmounted.
         */
        return () => providerActions.clearWallet()
    }, [])

    const loadWallet = async () => {
        try {
            const identity = await getIdentity()

            providerActions.injectWallet('0x' + identity.etherManagedPrivateKey)
        } catch (error) {
            console.error(error)

            showError('Cannot get your identity', error.message)
        }
    }

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
