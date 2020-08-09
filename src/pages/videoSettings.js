import React from "react"
import { useLocation } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoEditor from "@components/media/VideoEditor"

const VideoSettings = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  return (
    <LayoutWrapper>
      <SEO title="Edit Video" />
      <VideoEditor hash={query.get("v")} video={location.state || {}} />
    </LayoutWrapper>
  )
}

export default VideoSettings
