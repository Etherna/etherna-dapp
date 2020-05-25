import React from "react"
import { useParams } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ChannelEditor from "@components/channel/ChannelEditor"
import useSelector from "@state/useSelector"

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
