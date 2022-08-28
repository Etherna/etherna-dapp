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
import classNames from "classnames"

import classes from "@/styles/components/video/VideoPreview.module.scss"
import { ReactComponent as CreditIcon } from "@/assets/icons/credit.svg"
import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"

import VideoMenu from "./VideoMenu"
import Image from "@/components/common/Image"
import Skeleton from "@/components/common/Skeleton"
import Time from "@/components/media/Time"
import Avatar from "@/components/user/Avatar"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { shortenEthAddr } from "@/utils/ethereum"
import dayjs from "@/utils/dayjs"
import { encodedSvg } from "@/utils/svg"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

const thumbnailPreview = encodedSvg(<ThumbPlaceholder />)

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

  const [ownerAddress, profileName] = useMemo(() => {
    const ownerAddress = video.ownerAddress
    const profileName = (video.owner?.name) || shortenEthAddr(ownerAddress)
    return [ownerAddress, profileName]
  }, [video.ownerAddress, video.owner])

  const profileAvatar = useMemo(() => {
    const profileAvatar = video.owner?.avatar
    return profileAvatar
  }, [video.owner?.avatar])

  const videoThumbnail = useMemo(() => {
    return video.thumbnail
  }, [video.thumbnail])

  const isLoadingProfile = useMemo(() => {
    return !video.owner
  }, [video.owner])

  const isVideoOffered = useMemo(() => {
    return videoOffers?.offersStatus === "full" || videoOffers?.offersStatus === "sources"
  }, [videoOffers])

  const profileLink = useMemo(() => {
    const profileLink = ownerAddress ? routes.channel(ownerAddress) : null
    return profileLink
  }, [ownerAddress])

  return (
    <div className={classes.videoPreview}>
      <Link
        to={routes.watch(decentralizedLink ? video.reference : video.indexReference ?? video.reference)}
        state={{ video, videoOffers }}
      >
        <div className={classes.videoThumbnail}>
          <Image
            sources={videoThumbnail?.sources}
            placeholder="blur"
            blurredDataURL={videoThumbnail?.blurredBase64}
            fallbackSrc={thumbnailPreview}
          />
          {video.duration && video.duration > 0 && (
            <div className={classes.videoThumbnailDuration}>
              <Time duration={video.duration} />
            </div>
          )}
        </div>
      </Link>
      <div className={classes.videoInfo}>
        {!hideProfile && profileLink && (
          <Link to={profileLink}>
            <Skeleton show={isLoadingProfile} rounded>
              <Avatar
                className={classes.videoInfoAvatar}
                image={profileAvatar}
                address={ownerAddress}
              />
            </Skeleton>
          </Link>
        )}
        <div className={classes.videoInfoStats}>
          <Link
            to={routes.watch(decentralizedLink ? video.reference : video.indexReference ?? video.reference)}
            state={{ video, videoOffers }}
          >
            <h4 className={classes.videoInfoTitle}>{video.title || "???"}</h4>
          </Link>
          {!hideProfile && profileLink && (
            <Link to={profileLink}>
              <Skeleton show={isLoadingProfile}>
                <h5 className={classes.videoInfoProfileName}>
                  {profileName}
                </h5>
              </Skeleton>
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
