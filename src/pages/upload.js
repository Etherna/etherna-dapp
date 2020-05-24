import React from "react"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import Uploader from "@components/media/Uploader"

const UploadPage = () => (
    <LayoutWrapper>
        <SEO title="Upload a video" />
        <Uploader />
    </LayoutWrapper>
)

export default UploadPage
