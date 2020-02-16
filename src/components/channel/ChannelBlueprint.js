import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

const ChannelBlueprint = () => (
    <div>Editing</div>
)

const ImageObject = PropTypes.shape({
    "@type": PropTypes.string.isRequired,
    contentUrl: PropTypes.shape({
        "/": PropTypes.string.isRequired,
    }).isRequired,
})

ChannelBlueprint.propTypes = {
    channelName: PropTypes.string,
    channelDescription: PropTypes.string,
    channelImage: ImageObject,
    channelCover: ImageObject,
}

const mapState = (state) => {
    return {
        channelName: state.channel.name,
        channelDescription: state.channel.description,
        channelImage: state.channel.image,
        channelCover: state.channel.cover,
    }
}

export default connect(mapState)(ChannelBlueprint)