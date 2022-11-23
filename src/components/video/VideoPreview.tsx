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

import { ReactComponent as ThumbPlaceholder } from "@/assets/backgrounds/thumb-placeholder.svg"
import { ReactComponent as CreditIcon } from "@/assets/icons/credit.svg"

import Image from "@/components/common/Image"
import Time from "@/components/media/Time"
import { Avatar, Badge, Skeleton } from "@/components/ui/display"
import routes from "@/routes"
import useExtensionsStore from "@/stores/extensions"
import classNames from "@/utils/classnames"
import dayjs from "@/utils/dayjs"
import { shortenEthAddr } from "@/utils/ethereum"
import { encodedSvg } from "@/utils/svg"

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { VideoWithIndexes, VideoWithOwner } from "@/types/video"

const thumbnailPreview = encodedSvg(<ThumbPlaceholder />)

type VideoPreviewProps = {
  video: VideoWithIndexes & VideoWithOwner
  videoOffers?: VideoOffersStatus
  hideProfile?: boolean
  decentralizedLink?: boolean
  direction?: "horizontal" | "vertical"
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  video,
  videoOffers,
  hideProfile,
  decentralizedLink,
  direction = "vertical",
}) => {
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)

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

  const videoLink = useMemo(() => {
    return decentralizedLink
      ? video.reference
      : video.indexesStatus[indexUrl]?.indexReference ?? video.reference
  }, [decentralizedLink, indexUrl, video.indexesStatus, video.reference])

  return (
    <div
      className={classNames("flex w-full", {
        "flex-col": direction === "vertical",
        "flex-col sm:flex-row": direction === "horizontal",
      })}
    >
      <Link
        className={classNames("block", {
          "w-full shrink-0 sm:w-1/3": direction === "horizontal",
        })}
        to={routes.watch(videoLink)}
        state={{ video, ownerProfile: video.owner, videoOffers }}
      >
        <div className={classNames("relative flex w-full before:pb-[56.25%]", {})}>
          <Image
            className="bg-gray-200 dark:bg-gray-700"
            sources={videoThumbnail?.sources}
            placeholder="blur"
            blurredDataURL={videoThumbnail?.blurredBase64}
            layout="fill"
            fallbackSrc={thumbnailPreview}
          />
          {video.duration && video.duration > 0 && (
            <div
              className={classNames(
                "absolute right-0 bottom-0 left-auto top-auto m-2 px-1.5 py-1",
                "rounded-sm text-2xs font-semibold leading-none",
                "bg-gray-900 text-gray-100 sm:py-0.5 sm:text-xs"
              )}
            >
              <Time duration={video.duration} />
            </div>
          )}
        </div>
      </Link>
      <div
        className={classNames("flex space-x-2", {
          "mt-2": direction === "vertical",
          "mt-2 sm:mt-0 sm:ml-2 sm:flex-1": direction === "horizontal",
        })}
      >
        {!hideProfile && profileLink && (
          <div
            className={classNames({
              "sm:hidden": direction === "horizontal",
            })}
          >
            <Link to={profileLink}>
              <Skeleton show={isLoadingProfile} roundedFull>
                <Avatar size={32} image={profileAvatar} address={ownerAddress} />
              </Skeleton>
            </Link>
          </div>
        )}
        <div
          className={classNames("flex flex-grow flex-col overflow-hidden", {
            "sm:space-y-2": direction === "horizontal",
          })}
        >
          <Link
            to={routes.watch(videoLink)}
            state={{ video, ownerProfile: video.owner, videoOffers }}
          >
            <h4
              className={classNames(
                "flex-grow text-base font-semibold leading-tight",
                "text-gray-900 dark:text-gray-100",
                "max-w-full overflow-hidden text-ellipsis line-clamp-2"
              )}
              title={video.title}
            >
              {video.title || "???"}
            </h4>
          </Link>
          {!hideProfile && profileLink && (
            <Link to={profileLink}>
              <div className="flex items-center">
                {direction === "horizontal" && (
                  <div className="hidden sm:mr-2 sm:flex">
                    <Skeleton show={isLoadingProfile} roundedFull>
                      <Avatar size={32} image={profileAvatar} address={ownerAddress} />
                    </Skeleton>
                  </div>
                )}
                <Skeleton show={isLoadingProfile}>
                  <h5
                    className={classNames(
                      "max-w-full flex-grow overflow-hidden text-ellipsis text-sm font-semibold",
                      "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300",
                      "transition-colors duration-200"
                    )}
                  >
                    {profileName}
                  </h5>
                </Skeleton>
              </div>
            </Link>
          )}
          {video.createdAt && (
            <div className="text-xs text-gray-600 dark:text-gray-500">
              {dayjs.duration(dayjs(video.createdAt).diff(dayjs())).humanize(true)}
            </div>
          )}
          <div className={classNames("mt-2 grid auto-cols-max grid-flow-col gap-3 empty:mt-0")}>
            {isVideoOffered && (
              <Badge prefix={<CreditIcon width={16} aria-hidden />} color="primary" small>
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
