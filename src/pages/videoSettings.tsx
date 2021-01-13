import React from "react"
import { useLocation } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoEditor from "@components/media/VideoEditor"
import { VideoMetadata } from "@utils/video"

const VideoSettings = () => {
  const location = useLocation<VideoMetadata>()
  const query = new URLSearchParams(location.search)
  const hash = query.get("v")

  if (!hash) return null

  return (
    <LayoutWrapper>
      <SEO title="Edit Video" />
      <VideoEditor hash={hash} video={location.state || {}} />
    </LayoutWrapper>
  )
}

export default VideoSettings
