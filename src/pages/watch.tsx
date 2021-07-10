import React from "react"
import { useLocation } from "react-router-dom"

import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoView from "@components/video/VideoView"
import { Video } from "@classes/SwarmVideo/types"
import useRouteState from "@hooks/useRouteState"

const WatchPage = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const hash = query.get("v")
  const routeState = useRouteState<Video>()

  if (!hash) return null

  return (
    <AppLayoutWrapper hideSidebar floatingSidebar>
      <SEO title="Watch" />
      <VideoView hash={hash} routeState={routeState} />
    </AppLayoutWrapper>
  )
}

export default WatchPage
