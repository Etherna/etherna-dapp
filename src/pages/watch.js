import React from "react"
import { Location } from "@reach/router"
import { parse } from "querystring"
import { navigate } from "gatsby"

import Layout from "../components/layout/DefaultLayout"
import SEO from "../components/layout/SEO"
import VideoView from "../components/media/VideoView"
import * as Routes from "../routes"

const WatchPage = () => (
    <Layout>
        <SEO title="Watch" />
        <Location>
            {({ location }) => {
                const query = location.search.startsWith("?")
                    ? location.search.substr(1, location.search.length - 1)
                    : location.search
                const params = parse(query)

                if (params && params.v) {
                    return <VideoView hash={params.v} />
                } else {
                    navigate(Routes.getNotFoundLink())
                }
            }}
        </Location>
    </Layout>
)

export default WatchPage
