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
import classNames from "classnames"

import VideoOffersBadge from "./VideoOffersBadge"
import VideoOffersButton from "./VideoOffersButton"
import VideoRating from "./VideoRating"
import VideoShareButton from "./VideoShareButton"
import VideoStatusBadge from "./VideoStatusBadge"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import useVideoOffers from "@/hooks/useVideoOffers"
import useSelector from "@/state/useSelector"
import dayjs from "@/utils/dayjs"

type VideoDetailsInfoBarProps = {
  video: Video
  videoOffers?: VideoOffersStatus
}

const VideoDetailsInfoBar: React.FC<VideoDetailsInfoBarProps> = ({ video, videoOffers }) => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const { videoOffersStatus, offerResources, unofferResources } = useVideoOffers(video, {
    routeState: videoOffers,
    disable: isStandaloneGateway,
  })

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap">
        <div className="w-full flex flex-wrap items-start space-x-4 py-1 mb-4">
          <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />
          {!isStandaloneGateway && (
            <VideoOffersBadge video={video} offersStatus={videoOffersStatus?.offersStatus} />
          )}
        </div>
      </div>

      <div
        className={classNames(
          "flex flex-wrap -mx-container px-container py-container md:mx-0 md:rounded-md",
          "bg-gray-400/10 dark:bg-gray-700/50"
        )}
      >
        <div className="flex items-center w-full md:w-auto py-2">
          {video.createdAt && (
            <span className="text-gray-700 dark:text-gray-200 font-medium;">
              {dayjs(video.createdAt).format("LLL")}
            </span>
          )}
        </div>

        <div className="w-full md:w-auto md:ml-auto overflow-x-auto md:overflow-x-hidden py-2 scrollbar-none">
          <div className="flex items-center space-x-5 md:space-x-8 md:flex-row-reverse md:space-x-reverse">
            {video.indexReference && (
              <VideoRating
                videoId={video.indexReference}
                upvotes={video.totUpvotes}
                downvotes={video.totDownvotes}
              />
            )}
            <VideoShareButton reference={video.reference} indexReference={video.indexReference} />
            {!isStandaloneGateway && (
              <VideoOffersButton
                video={video}
                videoOffersStatus={videoOffersStatus}
                onOfferResources={offerResources}
                onUnofferResources={unofferResources}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDetailsInfoBar
