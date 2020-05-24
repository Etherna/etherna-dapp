import React from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ChannelEditor from "@components/channel/ChannelEditor"

const ChannelEditPage = () => {
    const { id } = useParams()
    const { name } = useSelector(state => state.profile)

    return (
        <LayoutWrapper>
            <SEO title={`Editing channel ${name || id}`} />
            <ChannelEditor address={id} />
        </LayoutWrapper>
    )
}

export default ChannelEditPage
