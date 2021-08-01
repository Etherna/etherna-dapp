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

import React, { useMemo, useRef, useState } from "react"
import classnames from "classnames"

import "./file-drag.scss"
import { ReactComponent as DragIcon } from "@svg/icons/drag.svg"

import Button from "@common/Button"
import FieldDesrcription from "@common/FieldDesrcription"
import { useErrorMessage } from "@state/hooks/ui"
import { isMimeCompatible } from "@utils/mimeTypes"

type FileDragProps = {
  id: string
  label?: string
  mimeTypes?: string
  disabled?: boolean
  uploadLimit?: number
  canAvoidEncoding?(contentType: string): boolean
  canEncodeFile?(contentType: string): boolean
  onSelectFile(file: File, encode: boolean): void
}

const FileDrag: React.FC<FileDragProps> = ({
  id,
  label,
  mimeTypes = "*",
  disabled,
  uploadLimit,
  canAvoidEncoding,
  canEncodeFile,
  onSelectFile,
}) => {
  const [file, setFile] = useState<File>()
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { showError } = useErrorMessage()

  const [isBrowserCompatible, isEncodable] = useMemo(() => {
    return [
      file && (canAvoidEncoding?.(file.type) ?? true),
      file && (canEncodeFile?.(file.type) ?? false),
    ]
  }, [file, canEncodeFile, canAvoidEncoding])

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
        setFile(file)
      } else {
        showError(
          "Size error",
          `Your file is too large. The maximum upload size is currently ${uploadLimit}MB.`
        )
      }
    } else {
      resetInput()
      console.warn("Error. No file selected from input.")
    }
  }

  const handleFileProcessing = (encode: boolean) => {
    if (file) {
      onSelectFile(file, encode)
    } else {
      console.error("No file selected. Cannot continue.")
    }
  }

  const handleCancel = () => {
    resetInput()
    setFile(undefined)
  }

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <>
      {file ? (
        <div className="file-drag-processing">
          <div className="file-drag-processing-header">
            <p className="file-drag-processing-title">
              <span>You selected <span className="text-black dark:text-white">{file.name}</span>. </span>
              {isEncodable ? (
                "Choose what you want to do with the file."
              ) : (
                "Are you sure you want to upload this file?"
              )}
            </p>
            <Button
              className="file-drag-processing-cancel"
              aspect="link-secondary"
              action={handleCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          </div>
          <div className="file-drag-processing-action-list">
            {isBrowserCompatible && (
              <div className="file-drag-processing-action">
                <Button action={() => handleFileProcessing(!isBrowserCompatible)} disabled={disabled}>
                  {isEncodable ? (
                    "Upload as is"
                  ) : (
                    "Yes, upload"
                  )}
                </Button>
                {isEncodable && (
                  <FieldDesrcription>
                    Upload this source as is without any encoding (make sure is optimized for the browser).
                  </FieldDesrcription>
                )}
              </div>
            )}

            {isEncodable && (
              <div className="file-drag-processing-action">
                <Button action={() => handleFileProcessing(true)} disabled={disabled}>
                  Encode and upload
                </Button>
                <FieldDesrcription>
                  Encoding will ensure the source is optimized and compitible with most browsers.
                  It might take several minutes to encode a high resolution video.
                </FieldDesrcription>
              </div>
            )}
          </div>
        </div>
      ) : (
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
              ref={inputRef}
            />
            <div className="drag-content">
              <DragIcon className="drag-icon" />

              <span className="drag-info">
                <span className="text-lg">{label || "Drag here"}</span>
              </span>
              <span className="drag-info drag-select">
                <span className="text-sm font-normal">or</span>
              </span>
              <div className="btn btn-primary-light drag-select">Select</div>

              {uploadLimit && (
                <small className="drag-size drag-select">{uploadLimit}MB</small>
              )}
            </div>
          </label>
        </div>
      )}
    </>
  )
}

export default FileDrag
