import React, { useState } from "react"
import classnames from "classnames"

import "./file-drag.scss"

import { ReactComponent as UploadLargeIcon } from "@svg/icons/upload-icon-lg.svg"

import Alert from "@components/common/Alert"
import { showError } from "@state/actions/modals"
import { isMimeCompatible } from "@utils/mimeTypes"

type FileDragProps = {
  id: string
  label?: string
  mimeTypes?: string
  disabled?: boolean
  uploadLimit?: number
  onSelectFile: (file: File|null|undefined) => void
}

const FileDrag = ({ id, label, mimeTypes = "*", disabled, uploadLimit, onSelectFile }: FileDragProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSizeLimitError, setShowSizeLimitError] = useState(false)

  const updateDragOver = (hasEntered: boolean) => {
    if ((hasEntered && !isDragOver) || (!hasEntered && isDragOver)) {
      setIsDragOver(hasEntered)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateDragOver(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateDragOver(false)

    const files = [...e.dataTransfer.files]

    handleFileSelect(files)
  }

  const checkFileMimeType = (mime: string) => {
    return isMimeCompatible(mime, mimeTypes.split(","))
  }

  const handleFileSelect = (files: FileList | File[] | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      if (!checkFileMimeType(file.type)) {
        showError("Invalid File", "File type of the selected element is not valid.")
        return
      }

      if (!uploadLimit || file.size <= uploadLimit * 1024 * 1024) {
        onSelectFile(file)
      } else {
        setShowSizeLimitError(true)
      }
    } else {
      onSelectFile(null)
    }
  }

  return (
    <>
      {showSizeLimitError && (
        <div className="mb-2">
          <Alert
            title="File size exceeded"
            type="warning"
            onClose={() => setShowSizeLimitError(false)}
          >
            Your file is too large. The maximum upload size is currently {uploadLimit}MB.
          </Alert>
        </div>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
      >
        <label
          htmlFor={id}
          className={classnames("drag-input", {
            "drag-over": isDragOver,
          })}
        >
          <input
            type="file"
            id={id}
            accept={mimeTypes}
            onChange={e => handleFileSelect(e.target.files)}
            disabled={disabled}
          />
          <div className="drag-content">
            <UploadLargeIcon />
            <span className="drag-info text-lg">{label || "Drag here"}</span>
            <span className="drag-info text-sm font-normal">or</span>
            <div className="btn btn-outline">Select</div>
            {uploadLimit && (
              <small className="bold">{uploadLimit}MB</small>
            )}
          </div>
        </label>
      </div>
    </>
  )
}

export default FileDrag
