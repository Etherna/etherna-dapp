import React from "react"

import SEO from "@components/layout/SEO"
import ExploreView from "@components/videos/ExploreView"

const HomePage = () => (
    <>
        <SEO
            title="Etherna"
            tagline="A transparent video platform"
            description="A transparent video platform"
        />
        <div className="p-4">
            <ExploreView />
        </div>
    </>
)

export default HomePage
