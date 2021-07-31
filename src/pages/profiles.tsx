import React from "react"

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfilesView from "@components/profile/ProfilesView"

const ProfilesPage = () => (
  <AppLayoutWrapper>
    <SEO title="Profiles" />
    <Container>
      <h1 className="mb-1">Profiles</h1>
      <p className="text-gray-700 dark:text-gray-300 mt-4">
        <span>Explore all the </span>
        <strong>Ethernauts</strong>
        <span>...</span>
      </p>

      <ProfilesView />
    </Container>
  </AppLayoutWrapper>
)

export default ProfilesPage
