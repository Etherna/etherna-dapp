import React from "react"

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ExploreView from "@components/video/ExploreView"

const HomePage = () => (
  <AppLayoutWrapper>
    <SEO
      title="Etherna"
      tagline="A transparent video platform"
      description="A transparent video platform"
    />
    <Container>
      <ExploreView />
    </Container>
  </AppLayoutWrapper>
)

export default HomePage
