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

import React, { useMemo } from "react"
import { Link } from "react-router-dom"

import classes from "@/styles/components/video/VideoPreview.module.scss"
import { ReactComponent as CreditIcon } from "@/assets/icons/credit.svg"
import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"

import VideoMenu from "./VideoMenu"
import StateLink from "@/components/common/StateLink"
import Image from "@/components/common/Image"
import Time from "@/components/media/Time"
import Avatar from "@/components/user/Avatar"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@/utils/ethereum"
import dayjs from "@/utils/dayjs"
import { encodedSvg } from "@/utils/svg"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import classNames from "classnames"

type VideoPreviewProps = {
  video: Video
  videoOffers?: VideoOffersStatus
  hideProfile?: boolean
  decentralizedLink?: boolean
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  video,
  videoOffers,
  hideProfile,
  decentralizedLink
}) => {
  const { address } = useSelector(state => state.user)

  const ownerAddress = video.ownerAddress
  const profileName = (video.owner?.name) || shortenEthAddr(ownerAddress)
  const profileAvatar = video.owner?.avatar

  const profileLink = ownerAddress ? routes.channel(ownerAddress) : null
  const videoLink = routes.watch(decentralizedLink ? video.reference : video.indexReference ?? video.reference)
  const videoSearch = new URL(videoLink, document.baseURI).search
  const videoPath = videoLink.replace(videoSearch, "")

  const isVideoOffered = useMemo(() => {
    return videoOffers?.offersStatus === "full" || videoOffers?.offersStatus === "sources"
  }, [videoOffers])

  const VideoLink: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Link
      to={{
        pathname: videoPath,
        search: videoSearch,
      }}
      state={{ video, videoOffers }}
    >
      {children}
    </Link>
  )

  return (
    <div className={classes.videoPreview}>
      <VideoLink>
        <div className={classes.videoThumbnail}>
          <Image
            sources={video.thumbnail?.sources}
            placeholder="blur"
            blurredDataURL={video.thumbnail?.blurredBase64}
            fallbackSrc={encodedSvg(<ThumbPlaceholder />)}
          />
          {video.duration && video.duration > 0 && (
            <div className={classes.videoThumbnailDuration}>
              <Time duration={video.duration} />
            </div>
          )}
        </div>
      </VideoLink>
      <div className={classes.videoInfo}>
        {!hideProfile && profileLink && (
          <Link to={profileLink}>
            <Avatar
              className={classes.videoInfoAvatar}
              image={profileAvatar}
              address={ownerAddress}
            />
          </Link>
        )}
        <div className={classes.videoInfoStats}>
          <VideoLink>
            <h4 className={classes.videoInfoTitle}>{video.title || "???"}</h4>
          </VideoLink>
          {!hideProfile && profileLink && (
            <Link to={profileLink}>
              <div>
                <h5 className={classes.videoInfoProfileName}>
                  {checkIsEthAddress(profileName)
                    ? shortenEthAddr(profileName)
                    : profileName || shortenEthAddr(profileName)}
                </h5>
              </div>
            </Link>
          )}
          {video.creationDateTime && (
            <div className={classes.videoInfoPublishTime}>
              {dayjs.duration(dayjs(video.creationDateTime).diff(dayjs())).humanize(true)}
            </div>
          )}
          <ul className={classes.videoBadges}>
            {isVideoOffered && (
              <li className={classNames(classes.videoPreviewBadge, classes.videoPreviewBadgeFreeToWatch)}>
                <CreditIcon aria-hidden />
                Free to watch
              </li>
            )}
          </ul>
        </div>
        {address === ownerAddress && (
          <VideoMenu video={video} hasOffers={videoOffers ? videoOffers.offersStatus !== "none" : false} />
        )}
      </div>
    </div>
  )
}

export default VideoPreview
