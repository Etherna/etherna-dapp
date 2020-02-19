import React from "react"

import Layout from "../components/layout/DefaultLayout"
import SEO from "../components/layout/SEO"
import VideoGrid from "../components/media/VideoGrid"

const videoObject = {
    "@type": "SwarmVideo",
    title: "My new video",
    hash: encodeURIComponent("33f1ea45b3404d1691911729a5dd618216bbd2031c9bf1459d4f4542fb13e067/test%20swarm.mp4"),
    duration: 600,
    channel: "0x9A0359B17651Bf2C5e25Fa9eFF49B11B3d4b1aE8"
}

const videos = (new Array(5)).fill('').map(() => videoObject)

const IndexPage = () => (
    <Layout>
        <SEO
            title="Etherna"
            tagline="A transparent video platform"
            description="A transparent video platform"
        />
        <VideoGrid label="Reccomended videos" videos={videos} />
    </Layout>
)

export default IndexPage
