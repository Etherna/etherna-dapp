import React from "react"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ProfileView from "@components/profile/ProfileView"

const ProfilePage = ({ id }) => (
    <Layout>
        <SEO title="Profile" />
        <ProfileView profileAddress={id} />
    </Layout>
)

export default ProfilePage
