import React from "react"
import classnames from "classnames"

import "./video-grid.scss"

import VideoPreviewPlaceholder from "../VideoPreviewPlaceholder"
import VideoPreview from "@components/video/VideoPreview"
import { Video } from "@classes/SwarmVideo/types"

type VideoGridProps = {
  label?: string
  videos?: Video[]
  mini?: boolean
}

const VideoGrid: React.FC<VideoGridProps> = ({ label, videos, mini }) => {
  const LabelTag = mini ? "h5" : "h3"
  return (
    <>
      {label && (
        <div className="video-grid-header">
          <LabelTag>{label}</LabelTag>
        </div>
      )}
      <div className={classnames("video-grid", { mini: mini })}>
        {videos === undefined && <VideoPreviewPlaceholder />}
        {videos &&
          videos.map((v, i) => (
            <VideoPreview video={v} hideProfile={mini} key={v.hash + `_${i}`} />
          ))}
      </div>
    </>
  )
}

export default VideoGrid
