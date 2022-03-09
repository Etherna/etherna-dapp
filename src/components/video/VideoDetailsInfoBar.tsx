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

import classes from "@styles/components/video/VideoDetailsInfoBar.module.scss"

import VideoRating from "./VideoRating"
import VideoStatusBadge from "./VideoStatusBadge"
import VideoOffersBadge from "./VideoOffersBadge"
import dayjs from "@utils/dayjs"
import type { Video, VideoOffersStatus } from "@definitions/swarm-video"

type VideoDetailsInfoBarProps = {
  video: Video
  videoOffers?: VideoOffersStatus
}

const VideoDetailsInfoBar: React.FC<VideoDetailsInfoBarProps> = ({ video, videoOffers }) => {
  return (
    <div className={classes.videoDetailsInfoBar}>
      <div className={classes.videoDetailsTop}>
        <div className={classes.videoDetailsBadges}>
          <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />
          <VideoOffersBadge video={video} videoOffers={videoOffers} />
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDetailsInfoBar
