import React from "react"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ExploreView from "@components/videos/ExploreView"

const IndexPage = () => (
    <Layout>
        <SEO
            title="Etherna"
            tagline="A transparent video platform"
            description="A transparent video platform"
        />
        <div className="p-4">
            <ExploreView  />
        </div>
    </Layout>
)

export default IndexPage
