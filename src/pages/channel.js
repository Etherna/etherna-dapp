import React from "react"

import Layout from "../components/layout/DefaultLayout"
import SEO from "../components/layout/SEO"

const ChannelPage = props => (
    <Layout>
        <SEO title="Channel" />
        <h1>channel {props.id}</h1>
    </Layout>
)

export default ChannelPage
