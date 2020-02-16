import React from "react"
import { Link } from "gatsby"
import { Router } from "@reach/router"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Channel from "./channel"

const IndexPage = () => (
    <Layout>
        <SEO title="Etherna" description="A transparent video platform" />

        {/* Dynamic routes */}
        <Router>
            <Channel path="/channel/:id" />
        </Router>
    </Layout>
)

export default IndexPage
