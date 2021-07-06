import React, { useState } from "react"
import { Redirect } from "react-router-dom"

import "./profile-editor.scss"

import ProfileInfoEdit from "@components/profile/ProfileInfoEdit"
import { Profile } from "@classes/SwarmProfile/types"
import Routes from "@routes"
import { useProfileUpdate } from "@state/hooks/profile"
import { useErrorMessage } from "@state/hooks/ui"

type ProfileEditorProps = {
  address: string
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ address }) => {
  const updateProfile = useProfileUpdate(address)
  const [isSavingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const { showError } = useErrorMessage()

  const handleSubmit = async (profileInfo: Profile) => {
    setSavingProfile(true)

    try {
      await updateProfile(profileInfo)

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
