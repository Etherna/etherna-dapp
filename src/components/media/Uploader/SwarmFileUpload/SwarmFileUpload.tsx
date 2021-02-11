import React, { useState, useEffect } from "react"
import axios, { Canceler } from "axios"

import "./swarm-upload.scss"

import Alert from "@common/Alert"
import Button from "@common/Button"
import ProgressBar from "@common/ProgressBar"
import { getResourceUrl, uploadManifestData } from "@utils/swarm"

// cancellation token function
let uploadCancel: Canceler|undefined

type SwarmFileUploadProps = {
  hash?: string
  buffer: ArrayBuffer
  filename?: string
  manifest?: string
  contentType: string
  path?: string
  showImagePreview?: boolean
  showConfirmation?: boolean
  disabled?: boolean
  pinContent?: boolean
  canUpload?: boolean
  onConfirmUpload?: () => void
  onProgressChange?: (progress: number) => void
  onFinishedUploading: (hash: string) => void
  onRemoveFile: () => void
}

const SwarmFileUpload = ({
  hash: previusHash,
  buffer,
  filename,
  manifest,
  contentType,
  path,
  showImagePreview,
  showConfirmation,
  disabled,
  pinContent = false,
  canUpload = true,
  onConfirmUpload,
  onProgressChange,
  onFinishedUploading,
  onRemoveFile,
}: SwarmFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [confirmed, setConfirmed] = useState(!showConfirmation && !isUploading)
  const [uploadProgress, setUploadProgress] = useState(previusHash ? 100 : 0)
  const [hash, setHash] = useState(previusHash)
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    if (confirmed && canUpload) {
      handleStartUpload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, canUpload])

  useEffect(() => {
    onProgressChange && onProgressChange(uploadProgress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress])

  const handleStartUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)
    setErrorMessage(undefined)
    setHash(undefined)

    try {
      const hash = await uploadManifestData(manifest, path, buffer, contentType, {
        cancelTokenCallback: c => (uploadCancel = c),
        progressCallback: p => setUploadProgress(p),
        pinContent: pinContent,
      })

      if (hash) {
        setHash(hash)
        onFinishedUploading(hash)
        setUploadProgress(100)
        setIsUploading(false)
        setConfirmed(false)
      } else {
        // should't go here but in case reset form.
        handleRemoveFile()
      }
    } catch (error) {
      console.error(error)

      if (!axios.isCancel(error)) {
        if (error && error.message === "Network Error") {
          setErrorMessage("Network Error. Check if the gateway is secured with a SSL certificate.")
        } else {
          setErrorMessage(error.message)
        }
      }
      setIsUploading(false)
    }
  }

  const confirmUpload = () => {
    setConfirmed(true)
    onConfirmUpload && onConfirmUpload()
  }

  const handleRemoveFile = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setErrorMessage(undefined)
    setHash(undefined)
    onRemoveFile()
  }

  const handleCancel = () => {
    if (uploadCancel) {
      uploadCancel("Upload canceled by user")
    }
    onRemoveFile()
  }

  const askToRemoveFile = () => {
    if (window.confirm("Remove the upload file?")) {
      handleRemoveFile()
    }
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
      {showConfirmation && buffer && !isUploading && uploadProgress === 0 && !confirmed && (
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
      {isUploading && !hash && (
        <>
          {uploadProgress < 100 ? <p>Uploading ({uploadProgress}%)...</p> : <p>Processing...</p>}
          <ProgressBar progress={uploadProgress} />
          <Button
            size="small"
            aspect="secondary"
            className="mt-2"
            action={handleRemoveFile}
            disabled={disabled}
          >
            Cancel
          </Button>
        </>
      )}
      {uploadProgress === 100 && hash && (
        <>
          {showImagePreview ? (
            <img src={getResourceUrl(`${hash}${path ? `/${path}` : ``}`)} alt="" />
          ) : (
            <p><span role="img" aria-label="Completed">✅</span> Upload completed!</p>
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
      )}
    </div>
  )
}

export default SwarmFileUpload