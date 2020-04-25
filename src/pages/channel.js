import React from "react"
import { useParams } from "react-router-dom"

import SEO from "@components/layout/SEO"
import ChannelView from "@components/channel/ChannelView"

const ChannelPage = () => {
    const { id } = useParams()

    return (
        <>
            <SEO title="Channel" />
            <ChannelView channelAddress={id} />
        </>
    )
}

export default ChannelPage
