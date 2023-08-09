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

import VideoOffersBadge from "./VideoOffersBadge"
import VideoOffersButton from "./VideoOffersButton"
import VideoRating from "./VideoRating"
import VideoShareButton from "./VideoShareButton"
import VideoStatusBadge from "./VideoStatusBadge"
import useVideoOffers from "@/hooks/useVideoOffers"
import useVideoPinning from "@/hooks/useVideoPinning"
import useExtensionsStore from "@/stores/extensions"
import { cn } from "@/utils/classnames"
import dayjs from "@/utils/dayjs"

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { VideoWithIndexes } from "@/types/video"

type VideoDetailsInfoBarProps = {
  video: VideoWithIndexes
  videoOffers?: VideoOffersStatus
}

const VideoDetailsInfoBar: React.FC<VideoDetailsInfoBarProps> = ({ video, videoOffers }) => {
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const { videoOffersStatus, offerResources, unofferResources } = useVideoOffers(video, {
    routeState: videoOffers,
    disable: gatewayType === "bee",
  })
  const { videoPinningStatus, pinResources, unpinResources } = useVideoPinning(video)
  const indexStatus = useMemo(() => {
    return video.indexesStatus[indexUrl]
  }, [indexUrl, video.indexesStatus])

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap">
        <div className="mb-4 flex w-full flex-wrap items-start space-x-4 py-1">
          <VideoStatusBadge status={indexStatus?.indexReference ? "available" : "unindexed"} />
          {gatewayType === "etherna-gateway" && (
            <VideoOffersBadge video={video} offersStatus={videoOffersStatus?.offersStatus} />
          )}
        </div>
      </div>

      <div
        className={cn(
          "-mx-container flex max-w-[100vw] flex-wrap px-container py-container md:mx-0 md:rounded-md",
          "bg-gray-400/10 dark:bg-gray-700/50"
        )}
      >
        <div className="flex w-full items-center py-2 md:w-auto">
          {video.preview.createdAt && (
            <span className="font-medium; text-gray-700 dark:text-gray-200">
              {dayjs(video.preview.createdAt).format("LLL")}
            </span>
          )}
        </div>

        <div className="w-full overflow-x-auto py-2 scrollbar-none md:ml-auto md:w-auto md:overflow-x-hidden">
          <div className="flex items-center space-x-5 md:flex-row-reverse md:space-x-8 md:space-x-reverse">
            {indexStatus && (
              <VideoRating
                videoId={indexStatus.indexReference}
                upvotes={indexStatus.totUpvotes}
                downvotes={indexStatus.totDownvotes}
              />
            )}
            <VideoShareButton
              reference={video.reference}
              indexReference={indexStatus?.indexReference}
            />
            {gatewayType === "etherna-gateway" && (
              <VideoOffersButton
                video={video}
                videoOffersStatus={videoOffersStatus}
                videoPinningStatus={videoPinningStatus}
                onOfferResources={offerResources}
                onUnofferResources={unofferResources}
                onPinResources={pinResources}
                onUnpinResources={unpinResources}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDetailsInfoBar
