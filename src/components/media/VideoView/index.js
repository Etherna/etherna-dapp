import React, { useState } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import "./video-view.scss"
import Player from "../Player"
import Avatar from "../../user/Avatar"
import getChannel from "../../../state/actions/channel/getChannel"
import { getResourceUrl } from "../../../utils/swarm"
import * as Routes from "../../../routes"

const VideoView = ({ hash }) => {
    const source = getResourceUrl(hash)
    const channel = "0x9A0359B17651Bf2C5e25Fa9eFF49B11B3d4b1aE8"
    const [title, setTitle] = useState("NO TITLE")
    const [description, setDescription] = useState(undefined)
    const [fetchedChannel, setFetchedChannel] = useState(false)
    const [channelName, setChannelName] = useState(undefined)
    const [channelAvatar, setChannelAvatar] = useState(undefined)
    const channelLink = Routes.getChannelLink(channel)

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
        <div className="video-watch">
            <Player
                source={source}
            />
            <div className="video-info">
                <h1 className="video-title">{title}</h1>

                <hr/>

                <div className="video-stats">
                    <Link to={channelLink}>
                        <div className="video-channel">
                            <Avatar image={channelAvatar} />
                            <h3 className="channel-name">{channelName}</h3>
                        </div>
                    </Link>
                </div>

                <hr/>

                <div className="video-description">
                    {!description &&
                        <p className="text-gray-500">
                            <em>This video doesn't have a description</em>
                        </p>
                    }
                </div>
            </div>
        </div>
    )
}

VideoView.propTypes = {
    hash : PropTypes.string.isRequired,
}

export default VideoView