import React from "react"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoCreate from "@components/video/VideoCreate"

const UploadPage = () => (
  <LayoutWrapper>
    <SEO title="Upload a video" />
    <VideoCreate />
  </LayoutWrapper>
)

export default UploadPage
