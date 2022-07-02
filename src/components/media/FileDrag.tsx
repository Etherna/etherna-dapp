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
import ReactDOM from "react-dom"
import classNames from "classnames"

import classes from "@/styles/components/media/FileDrag.module.scss"
import { ReactComponent as DragIcon } from "@/assets/icons/drag.svg"

import Button from "@/components/common/Button"
import FieldDesrcription from "@/components/common/FieldDesrcription"
import { useErrorMessage } from "@/state/hooks/ui"
import { isMimeCompatible } from "@/utils/mime-types"

type FileDragProps = {
  id: string
  portal?: string
  label?: string
  mimeTypes?: string
  disabled?: boolean
  uploadLimit?: number
  onSelectFile(file: File): void
}

const FileDrag: React.FC<FileDragProps> = (props) => {
  const { portal } = props
  const portalEl = portal ? document.querySelector(portal) : null

  const children = useMemo(() => {
    return <FileDragContent {...props} />
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (portalEl) {
    return ReactDOM.createPortal(
      <div className={classes.dragInputPortal}>{children}</div>,
      portalEl
    )
  } else {
    return children
  }
}

const FileDragContent: React.FC<FileDragProps> = ({
  id,
  label,
  mimeTypes = "*",
  disabled,
  uploadLimit,
  onSelectFile,
}) => {
  const [file, setFile] = useState<File>()
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { showError } = useErrorMessage()

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

  const handleFileProcessing = () => {
    if (file) {
      onSelectFile(file)
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
        <div className={classes.fileDragProcessing}>
          <div className={classes.fileDragProcessingHeader}>
            <p className={classes.fileDragProcessingTitle}>
              <span>You selected <span className="text-black dark:text-white">{file.name}</span>. </span>
              Are you sure you want to upload this file?
            </p>
            <Button
              className={classes.fileDragProcessingCancel}
              aspect="link"
              modifier="muted"
              onClick={handleCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          </div>
          <div className={classes.fileDragProcessingActionList}>
            <div>
              <Button onClick={() => handleFileProcessing()} disabled={disabled}>
                Upload
              </Button>
              <FieldDesrcription>
                Upload this source as is without any encoding (make sure is optimized for the browser).
              </FieldDesrcription>
            </div>
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
            className={classNames(classes.dragInput, {
              [classes.dragOver]: isDragOver,
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
            <div className={classes.dragContent}>
              <DragIcon className={classes.dragIcon} />

              <span className={classes.dragInfo}>
                <span className="text-lg">{label || "Drag here"}</span>
              </span>
              <span className={classNames(classes.dragInfo, classes.dragSelect)}>
                <span className="text-sm font-normal">or</span>
              </span>
              <Button as="div" className={classes.dragSelect} lighter>Select</Button>

              {uploadLimit && (
                <small className={classNames(classes.dragSize, classes.dragSelect)}>{uploadLimit}MB</small>
              )}
              <small className={classNames(classes.dragSize, classes.dragSelect)}>
                {mimeTypes.split(",").map(mime => "." + mime.replace(/^[a-z0-9]+\//, "")).join(" ")}
              </small>
            </div>
          </label>
        </div>
      )}
    </>
  )
}

export default FileDrag
