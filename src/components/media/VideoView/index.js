import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import { Link, Redirect } from "react-router-dom"

import "./video-view.scss"
import SEO from "@components/layout/SEO"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
import { getResourceUrl } from "@utils/swarm"
import { getProfile } from "@utils/3box"
import { getVideo } from "@utils/ethernaResources/videosResources"
import Routes from "@routes"
import DownloadIcon from "@icons/common/DownloadIcon"

const VideoView = ({ hash, video }) => {
    const source = getResourceUrl(hash)

    const [videoOnIndex, setVideoOnIndex] = useState(true)
    const [isFetchingVideo, setIsFetchingVideo] = useState(false)
    const [profileAddress, setProfileAddress] = useState(video.channelAddress)
    const [title, setTitle] = useState(video.title)
    const [description, setDescription] = useState(video.description)
    const [thumbnail, setThumbnail] = useState(
        getResourceUrl(video.thumbnailHash)
    )
    const [publishDate, setPublishDate] = useState(video.creationDateTime)
    const [profileName, setProfileName] = useState(
        video.profileData && video.profileData.name
    )
    const [profileAvatar, setProfileAvatar] = useState(
        video.profileData && video.profileData.avatar
    )

    useEffect(() => {
        if (Object.keys(video).length === 0) {
            fetchVideo()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (profileAddress) {
            fetchProfile(profileAddress)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileAddress])

    const fetchVideo = async () => {
        setIsFetchingVideo(true)

        const hasPrefetch =
            window.prefetchData && window.prefetchData.videoHash === hash

        try {
            const videoInfo = hasPrefetch
                ? window.prefetchData
                : await getVideo(hash)

            setProfileAddress(videoInfo.channelAddress)
            setTitle(videoInfo.title)
            setDescription(videoInfo.description)
            setThumbnail(getResourceUrl(videoInfo.thumbnailHash))
            setPublishDate(videoInfo.creationDateTime)
        } catch (error) {
            console.error(error)
            setVideoOnIndex(false)
        }
        setIsFetchingVideo(false)
    }

    const fetchProfile = async profileAddress => {
        try {
            const profile = await getProfile(profileAddress)
            setProfileName(profile.name)
            setProfileAvatar(profile.avatar)
        } catch (error) {
            console.error(error)
        }
    }

    if (isFetchingVideo) {
        return <div />
    }

    if (!isFetchingVideo && !videoOnIndex) {
        return <Redirect to={Routes.getNotFoundLink()} />
    }

    return (
        <>
            <SEO title={title} />
            <div className="video-watch container">
                <Player source={source} thumbnail={thumbnail} />
                <div className="video-info">
                    <h1 className="video-title">{title}</h1>
                    <div className="video-info-bar">
                        <div className="mr-auto">
                            <span className="publish-time">
                                {publishDate &&
                                    moment(publishDate).format("LLL")}
                            </span>
                        </div>
                        <div className="video-actions">
                            <a
                                download
                                href={source}
                                className="btn btn-transparent btn-rounded"
                            >
                                <DownloadIcon />
                            </a>
                        </div>
                    </div>

                    <hr />

                    <div className="video-stats">
                        <Link to={Routes.getChannelLink(profileAddress)}>
                            <div className="video-profile">
                                <Avatar image={profileAvatar} />
                                <h3 className="profile-name">{profileName}</h3>
                            </div>
                        </Link>
                    </div>

                    <hr />

                    <div className="video-description">
                        {description && description !== "" ? (
                            <p className="text-gray-800">{description}</p>
                        ) : (
                            <p className="text-gray-500">
                                <em>This video doesn't have a description</em>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

VideoView.propTypes = {
    hash: PropTypes.string.isRequired,
    video: PropTypes.object,
}

export default VideoView
