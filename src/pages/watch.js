import React from "react"
import { useLocation } from "react-router-dom"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import VideoView from "@components/media/VideoView"

const WatchPage = () => {
    const location = useLocation()
    const query = new URLSearchParams(location.search)

    return (
        <Layout showSidebar={false}>
            <SEO title="Watch" />
            <VideoView hash={query.get("v")} video={location.state || {}} />
        </Layout>
    )
}

export default WatchPage
