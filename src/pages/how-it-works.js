import React from "react"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"

const HowItWorks = () => (
    <LayoutWrapper hideSidebar={true}>
        <SEO title="How it works" />

        <div className="container my-8">
            <h1>How it works</h1>

            <h2>Decentralized video platform</h2>

            <h2>Login with a Wallet</h2>
            <h3>MetaMask</h3>
            <h3>WalletConnect</h3>
            <h3>Portis</h3>
            <h3>Fortmatic</h3>
            <h3>Authereum</h3>

            <h2>Create your channel</h2>

            <h2>Upload videos</h2>
        </div>
    </LayoutWrapper>
)

export default HowItWorks
