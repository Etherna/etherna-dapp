/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useState } from "react"
import { Redirect } from "react-router-dom"

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
    } catch (error: any) {
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
