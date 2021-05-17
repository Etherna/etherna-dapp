import React from "react"
import { Link } from "react-router-dom"

import "./video-preview.scss"
import thumbPlaceholder from "@svg/backgrounds/thumb-placeholder.svg?url"

import VideoMenu from "../VideoMenu"
import StateLink from "@common/StateLink"
import SwarmImg from "@common/SwarmImg"
import Time from "@components/media/Time"
import Avatar from "@components/user/Avatar"
import { Video } from "@classes/SwarmVideo/types"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import dayjs from "@utils/dayjs"

type VideoPreviewProps = {
  video: Video
  hideProfile?: boolean
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, hideProfile }) => {
  const { address } = useSelector(state => state.user)

  const profileAddress = video.ownerAddress
  const profileName = (video.owner?.profileData?.name) || shortenEthAddr(profileAddress)
  const profileAvatar = video.owner?.profileData?.avatar

  const profileLink = video.ownerAddress ? Routes.getProfileLink(video.ownerAddress) : null
  const videoLink = Routes.getVideoLink(video.hash)
  const videoSearch = new URL(videoLink, document.baseURI).search
  const videoPath = videoLink.replace(videoSearch, "")

  const VideoLink: React.FC = ({ children }) => (
    <StateLink
      to={{
        pathname: videoPath,
        search: videoSearch,
      }}
      state={video}
    >
      {children}
    </StateLink>
  )

  return (
    <div className="video-preview">
      <VideoLink>
        <div className="video-thumbnail">
          <SwarmImg
            image={video.thumbnail}
            fallback={thumbPlaceholder}
            className="w-full h-full"
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
              {dayjs.duration(dayjs(video.creationDateTime).diff(dayjs())).humanize(true)}
            </div>
          )}
        </div>
        {address === profileAddress && (
          <VideoMenu video={video} />
        )}
      </div>
    </div>
  )
}

export default VideoPreview
