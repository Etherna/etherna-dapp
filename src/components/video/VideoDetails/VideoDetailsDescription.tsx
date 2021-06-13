import React from "react"

import MarkdownPreview from "@common/MarkdownPreview"

type VideoDetailsDescriptionProps = {
  description?: string
}

const VideoDetailsDescription: React.FC<VideoDetailsDescriptionProps> = ({ description }) => {
  return (
    <div className="video-details-description">
      {description ? (
        <MarkdownPreview value={description} disableHeading={true} />
      ) : (
        <p className="video-details-empty">
          <em>This video doesn't have a description</em>
        </p>
      )}
    </div>
  )
}

export default VideoDetailsDescription
