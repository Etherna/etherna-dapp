import React from "react"
import { parse } from "querystring"

import PageNotFound from "./404"
import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import VideoView from "@components/media/VideoView"

const WatchPage = ({ location }) => {
    const query = location.search.startsWith("?")
        ? location.search.substr(1, location.search.length - 1)
        : location.search
    const params = parse(query)

    if (!params || !params.v) {
        return (
            <PageNotFound />
        )
    }

    return (
        <Layout showSidebar={false}>
            <SEO title="Watch" />
            <VideoView
                hash={params.v}
                video={location.state || {}}
            />
        </Layout>
    )
}

export default WatchPage
