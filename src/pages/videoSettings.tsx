import React from "react"
import { useLocation } from "react-router-dom"

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoUpdate from "@components/video/VideoUpdate"
import { Video } from "@classes/SwarmVideo/types"
import useRouteState from "@hooks/useRouteState"

const VideoSettings = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const hash = query.get("v")
  const routeState = useRouteState<Video>()

  if (!hash) return null

  return (
    <AppLayoutWrapper>
      <SEO title="Edit Video" />

      <Container>
        <VideoUpdate hash={hash} routeState={routeState} />
      </Container>
    </AppLayoutWrapper>
  )
}

export default VideoSettings
