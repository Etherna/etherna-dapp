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

import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"
import { ReactComponent as CreditIcon } from "@/assets/icons/credit.svg"

import { Avatar, Badge, Skeleton } from "../ui/display"
import Image from "@/components/common/Image"
import Time from "@/components/media/Time"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import routes from "@/routes"
import dayjs from "@/utils/dayjs"
import { shortenEthAddr } from "@/utils/ethereum"
import { encodedSvg } from "@/utils/svg"

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
  decentralizedLink,
}) => {
  const [ownerAddress, profileName] = useMemo(() => {
    const ownerAddress = video.ownerAddress
    const profileName = video.owner?.name || shortenEthAddr(ownerAddress)
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
    <div className="w-full">
      <Link
        to={routes.watch(
          decentralizedLink ? video.reference : video.indexReference ?? video.reference
        )}
        state={{ video, videoOffers }}
      >
        <div className="w-full relative flex before:pb-[62%]">
          <Image
            className="absolute inset-0 bg-gray-200 dark:bg-gray-700"
            sources={videoThumbnail?.sources}
            placeholder="blur"
            blurredDataURL={videoThumbnail?.blurredBase64}
            fallbackSrc={thumbnailPreview}
          />
          {video.duration && video.duration > 0 && (
            <div
              className={classNames(
                "m-2 px-1.5 py-1 absolute right-0 bottom-0 left-auto top-auto",
                "rounded-sm leading-none text-2xs font-semibold",
                "bg-gray-900 text-gray-100 sm:text-xs sm:py-0.5"
              )}
            >
              <Time duration={video.duration} />
            </div>
          )}
        </div>
      </Link>
      <div className="flex space-x-2 mt-2">
        {!hideProfile && profileLink && (
          <Link to={profileLink}>
            <Skeleton show={isLoadingProfile} roundedFull>
              <Avatar className="w-8 h-8" image={profileAvatar} address={ownerAddress} />
            </Skeleton>
          </Link>
        )}
        <div className="flex flex-col flex-grow overflow-hidden">
          <Link
            to={routes.watch(
              decentralizedLink ? video.reference : video.indexReference ?? video.reference
            )}
            state={{ video, videoOffers }}
          >
            <h4
              className={classNames(
                "flex-grow font-semibold leading-tight text-base",
                "text-gray-900 dark:text-gray-100",
                "line-clamp-2 max-w-full overflow-hidden text-ellipsis"
              )}
            >
              {video.title || "???"}
            </h4>
          </Link>
          {!hideProfile && profileLink && (
            <Link to={profileLink}>
              <Skeleton show={isLoadingProfile}>
                <h5
                  className={classNames(
                    "font-semibold text-sm max-w-full flex-grow overflow-hidden text-ellipsis",
                    "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300",
                    "transition-colors duration-200"
                  )}
                >
                  {profileName}
                </h5>
              </Skeleton>
            </Link>
          )}
          {video.creationDateTime && (
            <div className="text-xs text-gray-600 dark:text-gray-500">
              {dayjs.duration(dayjs(video.creationDateTime).diff(dayjs())).humanize(true)}
            </div>
          )}
          <div className="grid grid-flow-col auto-cols-max gap-3 mt-2 empty:mt-0">
            {isVideoOffered && (
              <Badge color="primary">
                <CreditIcon width={20} className="mr-1" aria-hidden />
                Free to watch
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPreview
