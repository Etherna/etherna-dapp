import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-preview.scss"
import Time from "../Time"
import Avatar from "@components/user/Avatar"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import { getProfile } from "@utils/swarmProfile"
import { getResourceUrl } from "@utils/swarm"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import VideoMenu from "../VideoMenu"

const VideoPreview = ({ video, hideProfile }) => {
    const { address } = useSelector(state => state.user)

    const profileAddress = video.channelAddress
    const thumbnail = video.thumbnailHash
        ? getResourceUrl(video.thumbnailHash)
        : undefined
    const [profileName, setProfileName] = useState(
        (video.profileData && video.profileData.name) ||
        shortenEthAddr(profileAddress)
    )
    const [profileAvatar, setProfileAvatar] = useState(
        video.profileData && video.profileData.avatar
    )

    const profileLink = Routes.getChannelLink(video.channelAddress)
    const videoLink = Routes.getVideoLink(video.videoHash)
    const videoSearch = new URL(videoLink, document.baseURI).search
    const videoPath = videoLink.replace(videoSearch, "")

    useEffect(() => {
        if (!video.profileData) {
            fetchProfile()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchProfile = async () => {
        const profile = await getProfile(video.channelAddress)
        video.profileData = profile

        setProfileName(profile.name || shortenEthAddr(profileAddress))
        setProfileAvatar(profile.avatar)
    }

    return (
        <div className="video-preview">
            <Link
                to={{
                    pathname: videoPath,
                    search: videoSearch,
                    state: video,
                }}
            >
                <div className="video-thumbnail">
                    {thumbnail && (
                        <img
                            src={thumbnail}
                            alt=""
                            className="h-full object-cover"
                        />
                    )}
                    {!thumbnail && (
                        <img
                            src={require("@svg/backgrounds/thumb-placeholder.svg")}
                            alt=""
                            className="w-full h-full"
                        />
                    )}
                    <div className="video-duration">
                        <Time duration={video.lengthInSeconds} />
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
                    <Link
                        to={{
                            pathname: videoPath,
                            search: videoSearch,
                            state: video,
                        }}
                    >
                        <h4 className="video-title">{video.title}</h4>
                    </Link>
                    {!hideProfile && (
                        <Link to={profileLink}>
                            <div className="video-profile">
                                <h5 className="profile-name">
                                    {
                                        checkIsEthAddress(profileName)
                                            ? shortenEthAddr(profileName)
                                            : profileName || shortenEthAddr(profileName)
                                    }
                                </h5>
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
                {address === profileAddress && (
                    <VideoMenu hash={video.videoHash} />
                )}
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
            avatar: PropTypes.object,
        }),
    }).isRequired,
    hideProfile: PropTypes.bool,
}

export default VideoPreview
