import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import "./video-preview.scss"
import Image from "@common/Image"
import Avatar from "@components/user/Avatar"
import { getTimeValues } from "@components/media/time"
import * as Routes from "@routes"
import { getProfile } from "@utils/3box"

const VideoPreview = ({ hash, title, thumbnail, duration, profileAddress }) => {
    const { hours, minutes, seconds } = getTimeValues(duration)
    const [profileName, setProfileName] = useState(undefined)
    const [profileAvatar, setProfileAvatar] = useState(undefined)
    const profileLink = Routes.getProfileLink(profileAddress)
    const videoLink = Routes.getVideoLink(hash)

    useEffect(() => {
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
    }, [profileAddress])

    return (
        <div className="video-preview">
            <Link to={videoLink}>
                <div className="video-thumbnail">
                    {thumbnail && <img src={thumbnail} alt="" />}
                    {!thumbnail && (
                        <Image
                            filename="thumb-placeholder.svg"
                            className="w-full h-full"
                        />
                    )}
                    <div className="video-duration">
                        {hours ? `${hours}:` : null}
                        {minutes}:{seconds}
                    </div>
                </div>
            </Link>
            <div className="video-info">
                <Link to={profileLink}>
                    <Avatar image={profileAvatar} address={profileAddress} />
                </Link>
                <div className="video-stats">
                    <Link to={videoLink}>
                        <h4 className="video-title">{title}</h4>
                    </Link>
                    <Link to={profileLink}>
                        <div className="video-profile">
                            <h5 className="profile-name">{profileName}</h5>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

VideoPreview.propTypes = {
    hash: PropTypes.string.isRequired,
    title: PropTypes.string,
    thumbnail: PropTypes.string,
    duration: PropTypes.number,
    profileAddress: PropTypes.string,
}

VideoPreview.defaultProps = {
    title: "NO TITLE",
    duration: 0,
}

export default VideoPreview
