import React from "react"

import "./video-source-preview.scss"

type VideoSourcePreviewProps = {
  name?: string
  statusText?: string
  actionsRender?: React.ReactNode
}

const VideoSourcePreview: React.FC<VideoSourcePreviewProps> = ({ children, name, statusText, actionsRender }) => {
  return (
    <div className="video-source-preview">
      <div className="video-source-preview-header">
        <span className="video-source-preview-name">{name}</span>

        <div className="video-source-preview-accessories">
          {actionsRender && (
            <span className="video-source-preview-actions">{actionsRender}</span>
          )}
          {statusText && (
            <span className="video-source-preview-status">{statusText}</span>
          )}
        </div>
      </div>

      <div className="video-source-preview-content">
        {children}
      </div>
    </div>
  )
}

export default VideoSourcePreview
