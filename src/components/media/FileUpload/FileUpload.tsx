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
import axios, { Canceler } from "axios"

import "./swarm-upload.scss"

import Alert from "@common/Alert"
import Button from "@common/Button"

// cancellation token function
let uploadCancel: Canceler | undefined

type FileUploadProps = {
  buffer: ArrayBuffer
  filename: string
  showConfirmation?: boolean
  disabled?: boolean
  canUpload?: boolean
  uploadHandler: (buffer: ArrayBuffer) => Promise<string>
  onConfirmUpload?: () => void
  onFinishedUploading: (hash: string) => void
  onCancel: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({
  buffer,
  filename,
  showConfirmation,
  disabled,
  canUpload = true,
  uploadHandler,
  onConfirmUpload,
  onFinishedUploading,
  onCancel,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [confirmed, setConfirmed] = useState(!showConfirmation && !isUploading)
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    if (confirmed && canUpload) {
      handleStartUpload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, canUpload])


  const handleStartUpload = async () => {
    setIsUploading(true)

    try {
      const hash = await uploadHandler(buffer)

      setIsUploading(false)
      setConfirmed(false)
      onFinishedUploading(hash)
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

  const confirmUpload = () => {
    setConfirmed(true)
    onConfirmUpload?.()
  }

  const handleRemoveFile = () => {
    setIsUploading(false)
    setErrorMessage(undefined)
    onCancel()
  }

  const handleCancel = () => {
    if (uploadCancel) {
      uploadCancel("Upload canceled by user")
    }
    onCancel()
  }

  return (
    <div className="mb-4">
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
      {showConfirmation && buffer && !isUploading && !confirmed && (
        <>
          <p className="text-gray-700 dark:text-gray-400 mb-3">
            You selected <span className="text-black dark:text-white">{filename}</span>. Do you confirm to upload
            this file?
          </p>
          <Button size="small" aspect="secondary" action={handleCancel} disabled={disabled}>
            Cancel
          </Button>
          <Button size="small" className="ml-2" action={confirmUpload} disabled={disabled}>
            OK
          </Button>
        </>
      )}
      {confirmed && !canUpload && <p className="text-gray-700 dark:text-gray-400 mb-3">Pending upload...</p>}
    </div>
  )
}

export default FileUpload
