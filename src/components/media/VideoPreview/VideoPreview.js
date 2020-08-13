import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import moment from "moment"

import "./video-preview.scss"

import Time from "../Time"
import VideoMenu from "../VideoMenu"
import SwarmImage from "@common/SwarmImage"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import Routes from "@routes"

/**
 * @typedef VideoGridProps
 * @property {import("@utils/video").VideoMetadata} video
 * @property {hideProfile} mini
 *
 * @param {VideoGridProps} param0
 */
const VideoPreview = ({ video, hideProfile }) => {
  const { address } = useSelector(state => state.user)

  const profileAddress = video.ownerAddress
  const profileName = (video.profileData && video.profileData.name) || shortenEthAddr(profileAddress)
  const profileAvatar = video.profileData && video.profileData.avatar

  const profileLink = Routes.getProfileLink(video.ownerAddress)
  const videoLink = Routes.getVideoLink(video.videoHash)
  const videoSearch = new URL(videoLink, document.baseURI).search
  const videoPath = videoLink.replace(videoSearch, "")

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
          <SwarmImage
            hash={video.thumbnailHash}
            fallback={require("@svg/backgrounds/thumb-placeholder.svg")}
            className="w-full h-full object-cover"
          />
          <div className="video-duration">
            <Time duration={video.duration} />
          </div>
        </div>
      </Link>
      <div className="video-info">
        {!hideProfile && (
          <Link to={profileLink}>
            <Avatar image={profileAvatar} address={profileAddress} />
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

VideoPreview.propTypes = {
  video: PropTypes.object.isRequired,
  hideProfile: PropTypes.bool,
}

export default VideoPreview
