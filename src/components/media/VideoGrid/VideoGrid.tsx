import React from "react"
import classnames from "classnames"

import "./video-grid.scss"

import VideoPreviewPlaceholder from "../VideoPreviewPlaceholder"
import VideoPreview from "@components/media/VideoPreview"
import { VideoMetadata } from "@utils/video"

type VideoGridProps = {
  label?: string
  videos?: VideoMetadata[]
  mini?: boolean
}

const VideoGrid = ({ label, videos, mini }: VideoGridProps) => {
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
            <VideoPreview video={v} hideProfile={mini} key={v.videoHash + `_${i}`} />
          ))}
      </div>
    </>
  )
}

export default VideoGrid
