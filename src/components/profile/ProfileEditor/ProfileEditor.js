import React, { useState } from "react"
import PropTypes from "prop-types"
import { Redirect } from "react-router-dom"

import "./profile-editor.scss"

import ProfileInfoEdit from "@components/profile/ProfileInfoEdit"
import { profileActions } from "@state/actions"
import { showError } from "@state/actions/modals"
import Routes from "@routes"

const ProfileEditor = ({ address }) => {
  const [isSavingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)

  const handleSubmit = async profileInfo => {
    setSavingProfile(true)

    try {
      await profileActions.updateProfile(profileInfo)

      // clear prefetch
      window.prefetchData = undefined

      setSavedProfile(true)
    } catch (error) {
      console.error(error)
      showError("Cannot save profile", error.message)
    }

    setSavingProfile(false)
  }

  if (savedProfile) {
    return <Redirect to={Routes.getProfileLink(address)} />
  }

  return (
    <ProfileInfoEdit
      profileAddress={address}
      isSubmitting={isSavingProfile}
      onSubmit={handleSubmit}
    />
  )
}

ProfileEditor.propTypes = {
  address: PropTypes.string.isRequired,
}

export default ProfileEditor
