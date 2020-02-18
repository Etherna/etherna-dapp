import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import "./channel.scss"
import getChannel from "../../../state/actions/channel/getChannel"
import {
    isImageObject,
    getImageUrl
} from "../../../utils/swarm"

const ChannelView = ({ currentAddress, channelAddress }) => {
    const [currentChannelAddress, setCurrentChannelAddress] = useState(undefined)
    const [channelName, setChannelName] = useState('')
    const [channelDescription, setChannelDescription] = useState('')
    const [channelAvatar, setChannelAvatar] = useState('')
    const [channelCover, setChannelCover] = useState('')

    useEffect(() => {
        if (currentChannelAddress !== channelAddress) {
            setCurrentChannelAddress(channelAddress)
            // Get channel data
            getChannel(channelAddress).then(channelData => {
                setChannelName(channelData.channelName)
                setChannelDescription(channelData.channelDescription)
                setChannelAvatar(channelData.channelAvatar)
                setChannelCover(channelData.channelCover)
            }).catch(error => {
                console.error(error)
            })
        }
    })

    return (
        <div className="channel">
            {isImageObject(channelCover) &&
                <div className="cover">
                    <img src={getImageUrl(channelCover)} alt={channelName} className="cover-image" />
                </div>
            }

            <div className="row items-center px-4">
                <div className="channel-avatar">
                    {isImageObject(channelAvatar) &&
                        <img src={getImageUrl(channelAvatar)} alt={channelName} />
                    }
                </div>
                {currentAddress && currentAddress === channelAddress &&
                    <Link to={`/channel/${channelAddress}/edit`} className="btn ml-auto self-center">Customize channel</Link>
                }
            </div>

            <div className="row">
                <div className="w-full sm:w-1/3 md:w-1/4 p-4">
                    <h1 className="channel-name">{channelName}</h1>
                    <p className="channel-bio">{channelDescription}</p>
                </div>
                <div className="w-full sm:w-2/3 md:w-3/4 p-4 bg-gray-100">

                </div>
            </div>
        </div>
    )
}

ChannelView.propTypes = {
    currentAddress: PropTypes.string,
    channelAddress: PropTypes.string,
}

const mapState = (state) => {
    return {
        currentAddress: state.user.currentAddress
    }
}

export default connect(mapState)(ChannelView)