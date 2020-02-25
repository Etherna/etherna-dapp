import React from "react"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ProfilesView from "@components/profile/ProfilesView"

const ProfilesPage = () => (
    <Layout>
        <SEO title="Profiles" />
        <div className="p-4">
            <h1 className="mb-1">Profiles</h1>
            <p className="text-gray-700">Explore all the <em><strong>Ethernauts</strong></em>...</p>

            <ProfilesView />
        </div>
    </Layout>
)

export default ProfilesPage
