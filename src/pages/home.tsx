import React from "react"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ExploreView from "@components/video/ExploreView"

const HomePage = () => (
  <LayoutWrapper>
    <SEO
      title="Etherna"
      tagline="A transparent video platform"
      description="A transparent video platform"
    />
    <div className="p-4">
      <ExploreView />
    </div>
  </LayoutWrapper>
)

export default HomePage
