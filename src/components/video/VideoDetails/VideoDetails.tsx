import React from "react"

import "./video-details.scss"

import VideoStatusBadge from "@components/video/VideoStatusBadge"
import VideoRating from "@components/video/VideoRating"
import { Video } from "@classes/SwarmVideo/types"
import VideoDetailsInfoBar from "./VideoDetailsInfoBar"
import VideoDetailsProfile from "./VideoDetailsProfile"
import VideoDetailsDescription from "./VideoDetailsDescription"
import VideoDetailsTitleBar from "./VideoDetailsTitleBar"

type VideoDetailsProps = {
  video: Video
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ video }) => {
  return (
    <div className="video-details">
      <VideoDetailsTitleBar title={video.title}>
        <VideoRating videoHash={video.hash} upvotes={video.totUpvotes} downvotes={video.totDownvotes} />
      </VideoDetailsTitleBar>

      <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />

      <VideoDetailsInfoBar creationDateTime={video.creationDateTime} />

      <VideoDetailsProfile owner={video.owner} />

      <VideoDetailsDescription description={video.description} />
    </div>
  )
}

export default VideoDetails
