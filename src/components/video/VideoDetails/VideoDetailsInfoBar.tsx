import React from "react"

import dayjs from "@utils/dayjs"

type VideoDetailsInfoBarProps = {
  creationDateTime?: string
}

const VideoDetailsInfoBar: React.FC<VideoDetailsInfoBarProps> = ({ creationDateTime }) => {
  return (
    <div className="video-details-info-bar">
      <div className="video-details-stats">
        {creationDateTime && (
          <span className="video-details-publish-time">
            {dayjs(creationDateTime).format("LLL")}
          </span>
        )}
      </div>

      <div className="video-details-actions">
        {/* <a download href={source} className="btn btn-transparent btn-rounded">
          <DownloadIcon />
        </a> */}
      </div>
    </div>
  )
}

export default VideoDetailsInfoBar
