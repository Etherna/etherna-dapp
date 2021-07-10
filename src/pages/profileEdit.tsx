import React from "react"
import { useParams } from "react-router-dom"

import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfileEditor from "@components/profile/ProfileEditor"
import useSelector from "@state/useSelector"

const ProfileEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const { name } = useSelector(state => state.profile)

  return (
    <AppLayoutWrapper>
      <SEO title={`Editing profile ${name || id}`} />
      <ProfileEditor address={id} />
    </AppLayoutWrapper>
  )
}

export default ProfileEditPage
