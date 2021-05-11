import React from "react"
import { Canceler } from "axios"

import Button from "@common/Button"
import ProgressBar from "@common/ProgressBar"

type FileUploadProgressProps = {
  progress: number
  disabled?: boolean
  canceler?: Canceler
  onCancelUpload?: () => void
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  progress,
  disabled,
  canceler,
  onCancelUpload
}) => {
  if (progress === 0) return null

  const handleCancel = () => {
    if (canceler) {
      canceler("User canceled the upload.")
    }
    onCancelUpload?.()
  }

  return (
    <>
      {progress < 100 ? <p>Uploading ({progress}%)...</p> : <p>Processing...</p>}
      <ProgressBar progress={progress} />
      <Button
        size="small"
        aspect="secondary"
        className="mt-2"
        action={handleCancel}
        disabled={disabled}
      >
        Cancel
      </Button>
    </>
  )
}

export default FileUploadProgress
