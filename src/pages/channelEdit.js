import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import Layout from "../components/layout/DefaultLayout"
import SEO from "../components/layout/SEO"
import ChannelBlueprint from "../components/channel/ChannelBlueprint"

const ChannelEditPage = ({ id, currentAddress }) => (
    <Layout>
        <SEO title="Channel Editing" />
        <h1>channel {id}</h1>

        {currentAddress && currentAddress === id && <ChannelBlueprint />}
    </Layout>
)

ChannelEditPage.propTypes = {
    id: PropTypes.string.isRequired,
    currentAddress: PropTypes.string,
}

const mapState = state => {
    return {
        currentAddress: state.profile.currentAddress,
    }
}

export default connect(mapState)(ChannelEditPage)
