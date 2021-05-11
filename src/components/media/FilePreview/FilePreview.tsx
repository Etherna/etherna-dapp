import React from "react"

import Button from "@common/Button"
import { isMimeImage } from "@utils/mimeTypes"

type FilePreviewProps = {
  previewUrl?: string
  contentType?: string
  disabled?: boolean
  onRemoveFile?: () => void
}

const FilePreview: React.FC<FilePreviewProps> = ({
  previewUrl,
  contentType,
  disabled,
  onRemoveFile
}) => {
  const askToRemoveFile = () => {
    if (window.confirm("Remove the upload file?")) {
      onRemoveFile?.()
    }
  }

  return (
    <>
      {previewUrl && isMimeImage(contentType ?? "") ? (
        <img src={previewUrl} alt="" />
      ) : (
        <p>
          <span role="img" aria-label="Completed">✅</span> Upload completed!
        </p>
      )}

      <Button
        size="small"
        aspect="secondary"
        className="mt-2"
        action={askToRemoveFile}
        disabled={disabled}
      >
        Remove
      </Button>
    </>
  )
}

export default FilePreview
