/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React from "react"
import { Link } from "react-router-dom"

import "./video-preview.scss"
import { ReactComponent as ThumbPlaceholder } from "@svg/backgrounds/thumb-placeholder.svg"

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
import { encodedSvg } from "@utils/svg"

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
            fallback={encodedSvg(<ThumbPlaceholder />)}
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
