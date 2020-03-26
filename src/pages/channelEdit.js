import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { navigate } from "gatsby"

import Layout from "@components/layout/DefaultLayout"
import SEO from "@components/layout/SEO"
import ChannelEditor from "@components/channel/ChannelEditor"
import * as Routes from "@routes"

const ChannelEditPage = ({ id }) => {
    const { address } = useSelector(state => state.user)
    const { name } = useSelector(state => state.profile)

    useEffect(() => {
        if (!address || address !== id) {
            navigate(Routes.getChannelLink(id))
        }
    })

    return (
        <Layout>
            <SEO title={`Editing channel ${name || id}`} />
            {address && address === id && <ChannelEditor address={id} />}
        </Layout>
    )
}

ChannelEditPage.propTypes = {
    id: PropTypes.string.isRequired,
}

export default ChannelEditPage
