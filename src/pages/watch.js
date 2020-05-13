import React from "react"
import { useLocation } from "react-router-dom"

import SEO from "@components/layout/SEO"
import VideoView from "@components/media/VideoView"

const WatchPage = () => {
    const location = useLocation()
    const query = new URLSearchParams(location.search)

    return (
        <>
            <SEO title="Watch" />
            <VideoView hash={query.get("v")} video={location.state || {}} />
        </>
    )
}

export default WatchPage
