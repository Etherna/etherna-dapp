import React from "react"

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
    <div className="p-4">
      <ExploreView />
    </div>
  </AppLayoutWrapper>
)

export default HomePage
