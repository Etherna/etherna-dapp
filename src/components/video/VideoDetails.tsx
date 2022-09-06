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

import VideoComments from "./VideoComments"
import VideoDetailsDescription from "./VideoDetailsDescription"
import VideoDetailsInfoBar from "./VideoDetailsInfoBar"
import VideoDetailsProfile from "./VideoDetailsProfile"
import VideoDetailsTitleBar from "./VideoDetailsTitleBar"
import VideoExtraMenu from "./VideoExtraMenu"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

type VideoDetailsProps = {
  video: Video
  videoOffers?: VideoOffersStatus
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ video, videoOffers }) => {
  return (
    <div>
      <VideoDetailsTitleBar title={video.title}>
        <VideoExtraMenu video={video} />
      </VideoDetailsTitleBar>

      <VideoDetailsInfoBar video={video} videoOffers={videoOffers} />

      <VideoDetailsProfile owner={video.owner} />

      <VideoDetailsDescription description={video.description} />

      {video.indexReference && (
        <VideoComments
          indexReference={video.indexReference}
          videoAuthorAddress={video.ownerAddress}
        />
      )}
    </div>
  )
}

export default VideoDetails
