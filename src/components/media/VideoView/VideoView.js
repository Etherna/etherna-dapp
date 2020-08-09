import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-view.scss"

import SEO from "@components/layout/SEO"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
import DownloadIcon from "@icons/common/DownloadIcon"
import UnindexedIcon from "@icons/common/UnindexedIcon"
import { getResourceUrl } from "@utils/swarm"
import { shortenEthAddr } from "@utils/ethFuncs"
import { fetchFullVideoInfo } from "@utils/video"
import Routes from "@routes"

/**
 * @typedef VideoViewProps
 * @property {string} hash
 * @property {import("@utils/video").VideoMetadata} video
 *
 * @param {VideoViewProps} param0
 */
const VideoView = ({ hash, video }) => {
  const [source, setSource] = useState(getResourceUrl(hash, true))
  const [videoOnIndex, setVideoOnIndex] = useState(null)
  const [isFetchingVideo, setIsFetchingVideo] = useState(false)
  const [profileAddress, setProfileAddress] = useState(video.channelAddress)
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description)
  const [thumbnail, setThumbnail] = useState(video.thumbnailSource)
  const [publishDate, setPublishDate] = useState(video.creationDateTime)
  const [profileName, setProfileName] = useState(video.profileData && video.profileData.name)
  const [profileAvatar, setProfileAvatar] = useState(video.profileData && video.profileData.avatar)

  useEffect(() => {
    Object.keys(video).length === 0 && fetchVideo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVideo = async () => {
    setIsFetchingVideo(true)

    /** @type {import("@utils/video").VideoMetadata} */
    const prefetch = window.prefetchData

    const hasPrefetch = prefetch && prefetch.videoHash === hash

    try {
      const videoInfo = hasPrefetch
        ? prefetch
        : await fetchFullVideoInfo(hash, true)

      setSource(videoInfo.source)
      setProfileAddress(videoInfo.channelAddress)
      setTitle(videoInfo.title)
      setDescription(videoInfo.description)
      setThumbnail(videoInfo.thumbnailSource)
      setPublishDate(videoInfo.creationDateTime)
      setVideoOnIndex(videoInfo.isVideoOnIndex)
      setProfileName(videoInfo.profileData && videoInfo.profileData.name)
      setProfileAvatar(videoInfo.profileData && videoInfo.profileData.avatar)
    } catch (error) {
      console.error(error)
      setVideoOnIndex(false)
    }
    setIsFetchingVideo(false)
  }

  if (isFetchingVideo) {
    return <div />
  }

  return (
    <>
      <SEO title={title || hash} />
      <div className="video-watch container">
        <Player source={source} thumbnail={thumbnail} />
        <div className="video-info">
          <h1 className="video-title">{title || "Title"}</h1>
          {videoOnIndex === false && (
            <div className="badge-unindexed">
              <UnindexedIcon color="var(--color-orange-800)" />
              Unindexed
            </div>
          )}
          <div className="video-info-bar">
            <div className="video-stats">
              <span className="publish-time">
                {publishDate && moment(publishDate).format("LLL")}
              </span>
            </div>
            <div className="video-actions">
              <a download href={source} className="btn btn-transparent btn-rounded">
                <DownloadIcon />
              </a>
            </div>
          </div>

          <hr />

          <div className="video-channel-info">
            <Link to={Routes.getChannelLink(profileAddress)}>
              <div className="video-profile">
                <Avatar image={profileAvatar} address={profileAddress || "0x0"} />
                <h3 className="profile-name">{profileName || shortenEthAddr(profileAddress)}</h3>
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
