/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useState, useEffect } from "react"
import axios from "axios"

import classes from "@/styles/components/media/FileUpload.module.scss"

import Alert from "@/components/common/Alert"
import Button from "@/components/common/Button"
import type { FilePreviewRenderProps } from "@/definitions/file-preview"

type FileUploadProps = {
  children?: React.ReactChild | ((props: FilePreviewRenderProps) => React.ReactChild)
  buffer: ArrayBuffer
  disabled?: boolean
  canUpload?: boolean
  uploadHandler: (buffer: ArrayBuffer) => Promise<string>
  onUploadStart?: () => void
  onUploadFinished: (hash: string) => void
  onCancel: () => void
  onUploadError: (errorMessage: string) => void
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
  onUploadError,
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
    } catch (error: any) {
      console.error(error)

      setIsUploading(false)

      let errorMessage = "Cound't upload the selected file"

      if (!axios.isCancel(error)) {
        if (error && error.message === "Network Error") {
          errorMessage = "Network Error. Check if the gateway is online."
        } else if (error.message) {
          errorMessage = error.message
        }

        setErrorMessage(errorMessage)
      }

      onUploadError(errorMessage)
    }
  }

  const handleRemoveFile = () => {
    setIsUploading(false)
    setErrorMessage(undefined)
    onCancel()
  }

  return (
    <div className={classes.fileUpload}>
      {errorMessage && (
        <>
          <Alert type="danger" title="Upload error">
            {errorMessage}
          </Alert>
          <Button modifier="muted" className="mt-2" onClick={handleRemoveFile} small>
            Retry
          </Button>
        </>
      )}

      {!errorMessage && (
        typeof children === "function"
          ? children({ isUploading })
          : children
      )}
    </div>
  )
}

export default FileUpload
