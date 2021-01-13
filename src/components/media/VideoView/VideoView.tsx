import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-view.scss"

import MarkdownPreview from "@common/MarkdownPreview"
import SEO from "@components/layout/SEO"
import Player from "@components/media/Player"
import Avatar from "@components/user/Avatar"
import UnindexedIcon from "@icons/common/UnindexedIcon"
import Routes from "@routes"
import { getResourceUrl } from "@utils/swarm"
import { shortenEthAddr } from "@utils/ethFuncs"
import { fetchFullVideoInfo, VideoMetadata } from "@utils/video"
import { WindowPrefetchData } from "typings/window"

type VideoViewProps = {
  hash: string
  video?: VideoMetadata
}

const VideoView = ({ hash, video }: VideoViewProps) => {
  const [sources, setSources] = useState(video?.sources)
  const [originalQuality, setOriginalQuality] = useState(video && video.originalQuality)
  const [videoOnIndex, setVideoOnIndex] = useState<boolean>()
  const [isFetchingVideo, setIsFetchingVideo] = useState(false)
  const [profileAddress, setProfileAddress] = useState(video?.ownerAddress)
  const [title, setTitle] = useState(video?.title)
  const [description, setDescription] = useState(video?.description)
  const [thumbnail, setThumbnail] = useState(video?.thumbnailSource)
  const [publishDate, setPublishDate] = useState(video?.creationDateTime)
  const [profileName, setProfileName] = useState(video?.profileData?.name)
  const [profileAvatar, setProfileAvatar] = useState(video?.profileData?.avatar)

  useEffect(() => {
    Object.keys(video || {}).length === 0 && fetchVideo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVideo = async () => {
    setIsFetchingVideo(true)

    const windowPrefetch = window as WindowPrefetchData
    const hasPrefetch = windowPrefetch.prefetchData?.video?.videoHash === hash

    try {
      const videoInfo = hasPrefetch
        ? windowPrefetch.prefetchData!.video!
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
        source: getResourceUrl(hash, true)!,
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
                  <UnindexedIcon color="#9a3412" />
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
            {/* Eventually a sidebar */}
          </aside>
        </div>
      </div>
    </>
  )
}

export default VideoView
