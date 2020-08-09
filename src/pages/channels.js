import React from "react"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ChannelsView from "@components/channel/ChannelsView"

const ChannelsPage = () => (
  <LayoutWrapper>
    <SEO title="Channels" />
    <div className="p-8">
      <h1 className="mb-1">Channels</h1>
      <p className="text-gray-700 mt-4">
        <span>Explore all the </span>
        <strong>Ethernauts</strong>
        <span>...</span>
      </p>

      <ChannelsView />
    </div>
  </LayoutWrapper>
)

export default ChannelsPage
