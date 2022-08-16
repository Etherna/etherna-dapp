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

import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import classes from "@/styles/components/video/VideoDetailsInfoBar.module.scss"

import VideoRating from "./VideoRating"
import VideoStatusBadge from "./VideoStatusBadge"
import VideoOffersButton from "./VideoOffersButton"
import VideoShareButton from "./VideoShareButton"
import VideoOffersBadge from "./VideoOffersBadge"
import useVideoOffers from "@/hooks/useVideoOffers"
import useSelector from "@/state/useSelector"
import dayjs from "@/utils/dayjs"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

type VideoDetailsInfoBarProps = {
  video: Video
  videoOffers?: VideoOffersStatus
}

const VideoDetailsInfoBar: React.FC<VideoDetailsInfoBarProps> = ({ video, videoOffers }) => {
  const navigate = useNavigate()
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const { videoOffersStatus, offerResources, unofferResources } = useVideoOffers(video, {
    routeState: videoOffers,
    disable: isStandaloneGateway,
  })

  useEffect(() => {
    if (videoOffersStatus) {
      // Replace current route state to avoid refresh inconsistency
      navigate(".", {
        replace: true,
        state: {
          video,
          videoOffers: videoOffersStatus,
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOffersStatus])

  return (
    <div className={classes.videoDetailsInfoBar}>
      <div className={classes.videoDetailsTop}>
        <div className={classes.videoDetailsBadges}>
          <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />
          {!isStandaloneGateway && (
            <VideoOffersBadge video={video} offersStatus={videoOffersStatus?.offersStatus} />
          )}
        </div>
      </div>

      <div className={classes.videoDetailsBottom}>
        <div className={classes.videoDetailsStats}>
          {video.createdAt && (
            <span className={classes.videoDetailsPublishTime}>
              {dayjs(video.createdAt).format("LLL")}
            </span>
          )}
        </div>

        <div className={classes.videoDetailsActions}>
          <div className={classes.videoDetailsActionsWrapper}>
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
