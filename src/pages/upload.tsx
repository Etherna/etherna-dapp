import React from "react"

import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoCreate from "@components/video/VideoCreate"

const UploadPage = () => (
  <AppLayoutWrapper>
    <SEO title="Upload a video" />
    <VideoCreate />
  </AppLayoutWrapper>
)

export default UploadPage
