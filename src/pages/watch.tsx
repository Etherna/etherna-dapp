import React from "react"
import { useLocation } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoView from "@components/video/VideoView"
import { Video } from "@classes/SwarmVideo/types"

const WatchPage = () => {
  const location = useLocation<Video>()
  const query = new URLSearchParams(location.search)
  const hash = query.get("v")

  if (!hash) return null

  return (
    <LayoutWrapper hideSidebar={true}>
      <SEO title="Watch" />
      <VideoView hash={hash} routeState={location.state} />
    </LayoutWrapper>
  )
}

export default WatchPage
