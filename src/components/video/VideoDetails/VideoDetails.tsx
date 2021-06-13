import React from "react"

import "./video-details.scss"

import VideoStatusBadge from "@components/video/VideoStatusBadge"
import { Video } from "@classes/SwarmVideo/types"
import VideoDetailsInfoBar from "./VideoDetailsInfoBar"
import VideoDetailsProfile from "./VideoDetailsProfile"
import VideoDetailsDescription from "./VideoDetailsDescription"

type VideoDetailsProps = {
  video: Video
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ video }) => {
  return (
    <div className="video-details">
      <h1 className="video-details-title">{video.title ?? ""}</h1>

      <VideoStatusBadge status={video.isVideoOnIndex ? "available" : "unindexed"} />

      <VideoDetailsInfoBar creationDateTime={video.creationDateTime} />

      <VideoDetailsProfile owner={video.owner} />

      <VideoDetailsDescription description={video.description} />
    </div>
  )
}

export default VideoDetails
