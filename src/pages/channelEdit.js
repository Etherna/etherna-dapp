import React from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ChannelEditor from "@components/channel/ChannelEditor"

const ChannelEditPage = () => {
    const { id } = useParams()
    const { name } = useSelector(state => state.profile)

    return (
        <Layout>
            <SEO title={`Editing channel ${name || id}`} />
            <ChannelEditor address={id} />
        </Layout>
    )
}

export default ChannelEditPage
