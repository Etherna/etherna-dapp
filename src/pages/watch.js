import React from "react"
import { useLocation } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import VideoView from "@components/media/VideoView"

const WatchPage = () => {
    const location = useLocation()
    const query = new URLSearchParams(location.search)

    return (
        <LayoutWrapper hideSidebar={true}>
            <SEO title="Watch" />
            <VideoView hash={query.get("v")} video={location.state || {}} />
        </LayoutWrapper>
    )
}

export default WatchPage
