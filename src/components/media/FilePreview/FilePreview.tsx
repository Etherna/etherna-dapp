import React from "react"

import Button from "@common/Button"
import { isMimeImage } from "@utils/mimeTypes"
import { useConfirmation } from "@state/hooks/ui"

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
  const { waitConfirmation } = useConfirmation()

  const askToRemoveFile = async () => {
    const remove = await waitConfirmation(
      "Remove file?",
      "Are you sure? Once is removed you won't be able to get it back without re-uploading it.",
      "Yes, Remove",
      "destructive"
    )
    if (remove) {
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
