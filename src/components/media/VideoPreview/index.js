import React, { useState } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import "./video-preview.scss"
import Image from "../../common/Image"
import Avatar from "../../user/Avatar"
import getChannel from "../../../state/actions/channel/getChannel"
import { getTimeValues } from "../time"
import * as Routes from "../../../routes"

const VideoPreview = ({ hash, title, thumbnail, duration, channel }) => {
    const { hours, minutes, seconds } = getTimeValues(duration)
    const [fetchedChannel, setFetchedChannel] = useState(false)
    const [channelName, setChannelName] = useState(undefined)
    const [channelAvatar, setChannelAvatar] = useState(undefined)
    const channelLink = Routes.getChannelLink(channel)
    const videoLink = Routes.getVideoLink(hash)

    if (!fetchedChannel && channel) {
        setFetchedChannel(true)
        getChannel(channel).then(channelData => {
            setChannelName(channelData.channelName)
            setChannelAvatar(channelData.channelAvatar)
        }).catch(error => {
            console.error(error)
        })
    }

    return (
        <div className="video-preview">
            <Link to={videoLink}>
                <div className="video-thumbnail">
                    {thumbnail &&
                        <img src={thumbnail} />
                    }
                    {!thumbnail &&
                        <Image filename="thumb-placeholder.svg" className="w-full h-full" />
                    }
                    <div className="video-duration">{hours ? `${hours}:` : null}{minutes}:{seconds}</div>
                </div>
            </Link>
            <div className="video-info">
                <Link to={channelLink}>
                    <Avatar image={channelAvatar} />
                </Link>
                <div className="video-stats">
                    <Link to={videoLink}>
                        <h4 className="video-title">{title}</h4>
                    </Link>
                    <Link to={channelLink}>
                        <div className="video-channel">
                            <h5 className="channel-name">{channelName}</h5>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

VideoPreview.propTypes = {
    hash : PropTypes.string.isRequired,
    title: PropTypes.string,
    thumbnail: PropTypes.string,
    duration: PropTypes.number,
    channel: PropTypes.string,
}

VideoPreview.defaultProps = {
    title: "NO TITLE",
    duration: 0
}

export default VideoPreview
