import React, { useState, useEffect } from "react"
import axios from "axios"

import "./file-upload.scss"

import Alert from "@common/Alert"
import Button from "@common/Button"
import { FilePreviewRenderProps } from "../FileUploadFlow/types"

type FileUploadProps = {
  children?: React.ReactChild | ((props: FilePreviewRenderProps) => React.ReactChild)
  buffer: ArrayBuffer
  disabled?: boolean
  canUpload?: boolean
  uploadHandler: (buffer: ArrayBuffer) => Promise<string>
  onUploadStart?: () => void
  onUploadFinished: (hash: string) => void
  onCancel: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({
  children,
  buffer,
  disabled,
  canUpload = true,
  uploadHandler,
  onUploadStart,
  onUploadFinished,
  onCancel,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    if (canUpload) {
      handleStartUpload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUpload])


  const handleStartUpload = async () => {
    setIsUploading(true)

    onUploadStart?.()

    try {
      const hash = await uploadHandler(buffer)

      onUploadFinished(hash)
    } catch (error) {
      console.error(error)

      setIsUploading(false)

      if (!axios.isCancel(error)) {
        if (error && error.message === "Network Error") {
          setErrorMessage("Network Error. Check if the gateway is secured with a SSL certificate.")
        } else {
          setErrorMessage(error.message)
        }
      }
    }
  }

  const handleRemoveFile = () => {
    setIsUploading(false)
    setErrorMessage(undefined)
    onCancel()
  }

  return (
    <div className="file-upload">
      {errorMessage && (
        <>
          <Alert type="danger" title="Upload error">
            {errorMessage}
          </Alert>
          <Button size="small" aspect="secondary" className="mt-2" action={handleRemoveFile}>
            Retry
          </Button>
        </>
      )}

      {typeof children === "function"
        ? children({ isUploading })
        : children
      }
    </div>
  )
}

export default FileUpload
