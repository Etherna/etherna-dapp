import React from "react"

import Layout from "components/layout/DefaultLayout"
import SEO from "components/layout/SEO"
import ChannelView from "components/channel/ChannelView"

const ChannelPage = ({ id }) => (
    <Layout>
        <SEO title="Channel" />
        <ChannelView channelAddress={id} />
    </Layout>
)

export default ChannelPage
