import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-view.scss"

import MarkdownPreview from "@common/MarkdownPreview"
import SEO from "@components/layout/SEO"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
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
  const [sources, setSources] = useState(video && video.sources)
  const [originalQuality, setOriginalQuality] = useState(video && video.originalQuality)
  const [videoOnIndex, setVideoOnIndex] = useState(null)
  const [isFetchingVideo, setIsFetchingVideo] = useState(false)
  const [profileAddress, setProfileAddress] = useState(video.ownerAddress)
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

      setSources(videoInfo.sources)
      setOriginalQuality(videoInfo.originalQuality)
      setProfileAddress(videoInfo.ownerAddress)
      setTitle(videoInfo.title)
      setDescription(videoInfo.description)
      setThumbnail(videoInfo.thumbnailSource)
      setPublishDate(videoInfo.creationDateTime)
      setVideoOnIndex(videoInfo.isVideoOnIndex)
      setProfileName(videoInfo.profileData && videoInfo.profileData.name)
      setProfileAvatar(videoInfo.profileData && videoInfo.profileData.avatar)
    } catch (error) {
      console.error(error)
      setSources([{
        source: getResourceUrl(hash, true),
        quality: null,
        size: null
      }])
      setVideoOnIndex(false)
    }
    setIsFetchingVideo(false)
  }

  if (isFetchingVideo || !sources) {
    return <div />
  }

  return (
    <>
      <SEO title={title || hash} />
      <div className="video-watch container">
        <div className="row justify-center">
          <div className="col lg:w-3/4">
            <Player sources={sources} originalQuality={originalQuality} thumbnail={thumbnail} />
            <div className="video-info">
              <h1 className="video-title">{title}</h1>
              {videoOnIndex === false && (
                <div className="badge-unindexed">
                  <UnindexedIcon color="fill-orange-800" />
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
                  {/* <a download href={source} className="btn btn-transparent btn-rounded">
                    <DownloadIcon />
                  </a> */}
                </div>
              </div>

              <div className="my-8">
                <hr />
                <div className="video-profile-info">
                  {profileAddress && (
                    <Link to={Routes.getProfileLink(profileAddress)}>
                      <div className="video-profile">
                        <Avatar image={profileAvatar} address={profileAddress || "0x0"} />
                        <h3 className="profile-name">{profileName || shortenEthAddr(profileAddress)}</h3>
                      </div>
                    </Link>
                  )}
                </div>
                <hr />
              </div>

              <div className="video-description">
                {description && description !== "" ? (
                  <MarkdownPreview value={description} disableHeading={true} />
                ) : (
                  <p className="text-gray-500">
                    <em>This video doesn't have a description</em>
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:w-1/4 hidden">
            Eventually a sidebar
          </aside>
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
