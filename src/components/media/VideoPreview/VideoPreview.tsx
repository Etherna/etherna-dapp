import React from "react"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-preview.scss"

import Time from "../Time"
import VideoMenu from "../VideoMenu"
import SwarmImage from "@common/SwarmImage"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import { VideoMetadata } from "@utils/video"
import Routes from "@routes"

type VideoPreviewProps = {
  video: VideoMetadata
  hideProfile?: boolean
}

const VideoPreview = ({ video, hideProfile }: VideoPreviewProps) => {
  const { address } = useSelector(state => state.user)

  const profileAddress = video.ownerAddress
  const profileName = (video.profileData?.name) || shortenEthAddr(profileAddress)
  const profileAvatar = video.profileData?.avatar

  const profileLink = video.ownerAddress ? Routes.getProfileLink(video.ownerAddress) : null
  const videoLink = Routes.getVideoLink(video.videoHash)
  const videoSearch = new URL(videoLink, document.baseURI).search
  const videoPath = videoLink.replace(videoSearch, "")

  const VideoLink = ({ children }: { children: React.ReactNode }) => (
    <Link
      to={{
        pathname: videoPath,
        search: videoSearch,
        state: video,
      }}
    >{children}</Link>
  )

  return (
    <div className="video-preview">
      <VideoLink>
        <div className="video-thumbnail">
          <SwarmImage
            hash={video.thumbnailHash}
            fallback={require("@svg/backgrounds/thumb-placeholder.svg").default}
            className="w-full h-full object-cover"
          />
          <div className="video-duration">
            <Time duration={video.duration} />
          </div>
        </div>
      </VideoLink>
      <div className="video-info">
        {!hideProfile && profileLink && (
          <Link to={profileLink}>
            <Avatar image={profileAvatar} address={profileAddress} />
          </Link>
        )}
        <div className="video-stats">
          <VideoLink>
            <h4 className="video-title">{video.title}</h4>
          </VideoLink>
          {!hideProfile && profileLink && (
            <Link to={profileLink}>
              <div className="video-profile">
                <h5 className="profile-name">
                  {checkIsEthAddress(profileName)
                    ? shortenEthAddr(profileName)
                    : profileName || shortenEthAddr(profileName)}
                </h5>
              </div>
            </Link>
          )}
          {video.creationDateTime && (
            <div className="publish-time">
              {moment.duration(moment(video.creationDateTime).diff(moment())).humanize(true)}
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

export default VideoPreview
