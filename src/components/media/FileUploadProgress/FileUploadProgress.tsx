import React from "react"

import "./file-upload-progress.scss"

import ProgressBar from "@common/ProgressBar"

type FileUploadProgressProps = {
  progress: number
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  progress,
}) => {
  if (progress === 0) return null

  return (
    <div className="file-upload-progress">
      <ProgressBar progress={progress} />
      <span className="file-upload-progress-value">
        {progress}%
      </span>
      <span className="file-upload-progress-text">
        {progress < 100 ? <p>Uploading...</p> : <p>Processing...</p>}
      </span>
    </div>
  )
}

export default FileUploadProgress
