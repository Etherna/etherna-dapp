import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import "./video-view.scss"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
import { getResourceUrl } from "@utils/swarm"
import { getProfile } from "@utils/3box"
import * as Routes from "@routes"

const VideoView = ({ hash }) => {
    // TODO: get real profile address
    const profileAddress = "0x9A0359B17651Bf2C5e25Fa9eFF49B11B3d4b1aE8"

    const source = getResourceUrl(hash)
    const [title, setTitle] = useState(undefined)
    const [description, setDescription] = useState(undefined)
    const [profileName, setProfileName] = useState(undefined)
    const [profileAvatar, setProfileAvatar] = useState(undefined)
    const profileLink = Routes.getProfileLink(profileAddress)

    useEffect(() => {
        const videoTitle = ""
        const videoDescription = undefined

        if (title !== videoTitle) {
            setTitle(videoTitle)
        }
        if (description !== videoDescription) {
            setDescription(videoDescription)
        }

        if (profileAddress) {
            getProfile(profileAddress)
                .then(profileData => {
                    setProfileName(profileData.name)
                    setProfileAvatar(profileData.image)
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }, [title, description])

    return (
        <div className="video-watch">
            <Player source={source} />
            <div className="video-info">
                <h1 className="video-title">{title}</h1>

                <hr />

                <div className="video-stats">
                    <Link to={profileLink}>
                        <div className="video-profile">
                            <Avatar image={profileAvatar} />
                            <h3 className="profile-name">{profileName}</h3>
                        </div>
                    </Link>
                </div>

                <hr />

                <div className="video-description">
                    {!description && (
                        <p className="text-gray-500">
                            <em>This video doesn't have a description</em>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

VideoView.propTypes = {
    hash: PropTypes.string.isRequired,
}

export default VideoView
