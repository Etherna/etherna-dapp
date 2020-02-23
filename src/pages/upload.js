import React from "react"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import Uploader from "@components/media/Uploader"

const UploadPage = () => (
    <Layout>
        <SEO title="Upload a video" />
        <Uploader />
    </Layout>
)

export default UploadPage
