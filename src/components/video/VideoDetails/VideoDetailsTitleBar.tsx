import React from "react"

type VideoDetailsTitleBarProps = {
  title?: string
}

const VideoDetailsTitleBar: React.FC<VideoDetailsTitleBarProps> = ({ title, children }) => {
  return (
    <div className="video-details-titlebar">
      <h1 className="video-details-title">{title ?? ""}</h1>

      <div className="video-details-actions">
        {children}
      </div>
    </div>
  )
}

export default VideoDetailsTitleBar
