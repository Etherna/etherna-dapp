import React from "react"
import { useParams } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfileEditor from "@components/profile/ProfileEditor"
import useSelector from "@state/useSelector"

const ProfileEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const { name } = useSelector(state => state.profile)

  return (
    <LayoutWrapper>
      <SEO title={`Editing profile ${name || id}`} />
      <ProfileEditor address={id} />
    </LayoutWrapper>
  )
}

export default ProfileEditPage
