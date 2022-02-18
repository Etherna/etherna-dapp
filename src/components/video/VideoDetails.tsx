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

import VideoDetailsInfoBar from "./VideoDetailsInfoBar"
import VideoDetailsProfile from "./VideoDetailsProfile"
import VideoDetailsDescription from "./VideoDetailsDescription"
import VideoDetailsTitleBar from "./VideoDetailsTitleBar"
import VideoStatusBadge from "@components/video/VideoStatusBadge"
import VideoRating from "@components/video/VideoRating"
import type { Video } from "@definitions/swarm-video"

type VideoDetailsProps = {
  video: Video
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ video }) => {
  return (
    <div>
      <VideoDetailsTitleBar title={video.title}>
        {video.isVideoOnIndex && (
          <VideoRating
            videoHash={video.reference}
            upvotes={video.totUpvotes}
            downvotes={video.totDownvotes}
          />
        )}
      </VideoDetailsTitleBar>

      <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />

      <VideoDetailsInfoBar createdAt={video.createdAt ? video.createdAt : null} />

      <VideoDetailsProfile owner={video.owner} />

      <VideoDetailsDescription description={video.description} />
    </div>
  )
}

export default VideoDetails
