import React from "react"
import { Link, navigate } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const ChannelPage = props => (
    <Layout>
        <SEO title="Channel" />
        <h1>channel {props.id}</h1>
    </Layout>
)

export default ChannelPage
