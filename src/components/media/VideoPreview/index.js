import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"
import moment from "moment"

import "./video-preview.scss"
import Image from "@common/Image"
import Avatar from "@components/user/Avatar"
import { getTimeValues } from "@components/media/time"
import { getResourceUrl } from "@utils/swarm"
import { getProfile } from "@utils/3box"
import * as Routes from "@routes"

const VideoPreview = ({ video, hideProfile }) => {
    const { hours, minutes, seconds } = getTimeValues(video.lengthInSeconds)
    const profileLink = Routes.getProfileLink(video.channelAddress)
    const videoLink = Routes.getVideoLink(video.videoHash)
    const profileAddress = video.channelAddress
    const thumbnail = video.thumbnailHash
        ? getResourceUrl(video.thumbnailHash)
        : undefined
    const [profileName, setProfileName] = useState(
        video.profileData && video.profileData.name
    )
    const [profileAvatar, setProfileAvatar] = useState(
        video.profileData && video.profileData.avatar
    )

    useEffect(() => {
        if (!video.profileData) {
            fetchProfile()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchProfile = async () => {
        const profile = await getProfile(video.channelAddress)
        video.profileData = profile

        setProfileName(profile.name)
        setProfileAvatar(profile.avatar)
    }

    return (
        <div className="video-preview">
            <Link to={videoLink} state={video}>
                <div className="video-thumbnail">
                    {thumbnail && (
                        <img
                            src={thumbnail}
                            alt=""
                            className="h-full object-cover"
                        />
                    )}
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
                {!hideProfile && (
                    <Link to={profileLink}>
                        <Avatar
                            image={profileAvatar}
                            address={profileAddress}
                        />
                    </Link>
                )}
                <div className="video-stats">
                    <Link to={videoLink} state={video}>
                        <h4 className="video-title">{video.title}</h4>
                    </Link>
                    {!hideProfile && (
                        <Link to={profileLink}>
                            <div className="video-profile">
                                <h5 className="profile-name">{profileName}</h5>
                            </div>
                        </Link>
                    )}
                    {video.creationDateTime && (
                        <div className="publish-time">
                            {moment
                                .duration(
                                    moment(video.creationDateTime).diff(
                                        moment()
                                    )
                                )
                                .humanize(true)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

VideoPreview.propTypes = {
    video: PropTypes.shape({
        channelAddress: PropTypes.string.isRequired,
        creationDateTime: PropTypes.string,
        thumbnailHash: PropTypes.string,
        title: PropTypes.string,
        lengthInSeconds: PropTypes.number,
        videoHash: PropTypes.string.isRequired,
        profileData: PropTypes.shape({
            name: PropTypes.string,
            avatar: PropTypes.arrayOf(PropTypes.object),
        }),
    }).isRequired,
    hideProfile: PropTypes.bool,
}

export default VideoPreview
