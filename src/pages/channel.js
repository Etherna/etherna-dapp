import React from "react"
import { useParams } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ChannelView from "@components/channel/ChannelView"

const ChannelPage = () => {
    const { id } = useParams()

    return (
        <LayoutWrapper>
            <SEO title="Channel" />
            <ChannelView channelAddress={id} />
        </LayoutWrapper>
    )
}

export default ChannelPage
