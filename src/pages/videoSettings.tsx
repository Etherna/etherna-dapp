import React from "react"
import { useLocation } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
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
    <LayoutWrapper>
      <SEO title="Edit Video" />
      <VideoUpdate hash={hash} routeState={routeState} />
    </LayoutWrapper>
  )
}

export default VideoSettings
