import React from "react"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ChannelsView from "@components/channel/ChannelsView"

const ChannelsPage = () => (
    <Layout>
        <SEO title="Channels" />
        <div className="p-4">
            <h1 className="mb-1">Channels</h1>
            <p className="text-gray-700 mt-4">
                <span>Explore all the </span>
                <strong>Ethernauts</strong>
                <span>...</span>
            </p>

            <ChannelsView />
        </div>
    </Layout>
)

export default ChannelsPage
