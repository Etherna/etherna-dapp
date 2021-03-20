import { useLocation } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoUpdate from "@components/video/VideoUpdate"
import { Video } from "@classes/SwarmVideo/types"

const VideoSettings = () => {
  const location = useLocation<Video>()
  const query = new URLSearchParams(location.search)
  const hash = query.get("v")

  if (!hash) return null

  return (
    <LayoutWrapper>
      <SEO title="Edit Video" />
      <VideoUpdate hash={hash} routeState={location.state} />
    </LayoutWrapper>
  )
}

export default VideoSettings
