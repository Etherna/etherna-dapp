import React, { useState } from "react"
import { Redirect } from "react-router-dom"

import "./profile-editor.scss"

import ProfileInfoEdit from "@components/profile/ProfileInfoEdit"
import { Profile } from "@classes/SwarmProfile/types"
import Routes from "@routes"
import { profileActions } from "@state/actions"
import { showError } from "@state/actions/modals"

type ProfileEditorProps = {
  address: string
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ address }) => {
  const [isSavingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)

  const handleSubmit = async (profileInfo: Profile) => {
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

export default ProfileEditor
