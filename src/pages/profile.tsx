import React from "react"
import { useParams } from "react-router-dom"

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfileView from "@components/profile/ProfileView"

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <AppLayoutWrapper>
      <SEO title="Profile" />

      <Container noPaddingX noPaddingY>
        <ProfileView profileAddress={id} />
      </Container>
    </AppLayoutWrapper>
  )
}

export default ProfilePage
