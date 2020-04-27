import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import "./channel-preview.scss"
import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"
import Routes from "@routes"

const ChannelPreview = ({ channelAddress, avatar, name, videos }) => {
    return (
        <div className="channel-preview" key={channelAddress}>
            <div className="channel-info">
                <Link to={Routes.getChannelLink(channelAddress)}>
                    <Avatar image={avatar} address={channelAddress} />
                </Link>
                <Link to={Routes.getChannelLink(channelAddress)}>
                    <h3>{name}</h3>
                </Link>
            </div>
            {videos && videos.length > 0 ? (
                <VideoGrid videos={videos} mini={true} />
            ) : (
                <p className="text-gray-600 italic">No videos uploaded yet</p>
            )}
        </div>
    )
}

ChannelPreview.propTypes = {
    channelAddress: PropTypes.string.isRequired,
    avatar: PropTypes.any,
    name: PropTypes.string,
    videos: PropTypes.array,
}

export default ChannelPreview
