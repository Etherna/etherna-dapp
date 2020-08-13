import React from "react"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"

const HowItWorks = () => (
  <LayoutWrapper hideSidebar={true}>
    <SEO title="How it works" />

    <div className="container my-8">
      <h1>How it works</h1>

      <h2>Decentralized video platform</h2>

      <h2>Users</h2>
      <h3>Update your profile information</h3>
      <h3>Upload videos</h3>

      <h2>Cutomization</h2>
      <h3>Change Index</h3>
      <h3>Change Gateway</h3>
      <h3>Customize shortcuts</h3>
      <h3>Dark Mode</h3>
    </div>
  </LayoutWrapper>
)

export default HowItWorks
