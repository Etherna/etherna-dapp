import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { navigate } from "gatsby"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ProfileEditor from "@components/profile/ProfileEditor"
import * as Routes from "@routes"

const ProfileEditPage = ({ id }) => {
    const { address } = useSelector(state => state.user)
    const { name } = useSelector(state => state.profile)

    useEffect(() => {
        if (!address || address !== id) {
            navigate(Routes.getProfileLink(id))
        }
    })

    return (
        <Layout>
            <SEO title={`Editing channel ${name || id}`} />
            {address && address === id && (
                <ProfileEditor address={id} />
            )}
        </Layout>
    )
}

ProfileEditPage.propTypes = {
    id: PropTypes.string.isRequired,
}

export default ProfileEditPage
