import React from "react"

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoCreate from "@components/video/VideoCreate"

const UploadPage = () => (
  <AppLayoutWrapper>
    <SEO title="Upload a video" />

    <Container noPaddingX noPaddingY>
      <VideoCreate />
    </Container>
  </AppLayoutWrapper>
)

export default UploadPage
