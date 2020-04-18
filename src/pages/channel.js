import React from "react"
import { useParams } from "react-router-dom"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ChannelView from "@components/channel/ChannelView"

const ChannelPage = () => {
    const { id } = useParams()

    return (
        <Layout>
            <SEO title="Channel" />
            <ChannelView channelAddress={id} />
        </Layout>
    )
}

export default ChannelPage
