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
import React, { useCallback, useRef, useState } from "react"

import { ReactComponent as DragIcon } from "@/assets/icons/drag.svg"

import { Button } from "@/components/ui/actions"
import { Portal } from "@/components/ui/layout"
import useErrorMessage from "@/hooks/useErrorMessage"
import classNames from "@/utils/classnames"
import { isMimeCompatible } from "@/utils/mime-types"

type FileDragProps = {
  id: string
  portal?: string
  label?: string | React.ReactNode
  confirmChildren?: React.ReactNode | ((file: File) => React.ReactNode)
  mimeTypes?: string
  uploadLimit?: number
  showMimes?: boolean
  disabled?: boolean
  canSelectFile?(file: File): Promise<boolean>
  onSelectFile(file: File): void
}

const FileDrag: React.FC<FileDragProps> = ({ portal, ...props }) => {
  if (portal) {
    return (
      <Portal selector={portal}>
        <div className="max-w-2xl rounded bg-gray-900/5 px-4 py-8 dark:bg-gray-100/5">
          <FileDragContent {...props} />
        </div>
      </Portal>
    )
  } else {
    return <FileDragContent {...props} />
  }
}

const FileDragContent: React.FC<FileDragProps> = ({
  id,
  label,
  mimeTypes = "*",
  confirmChildren,
  uploadLimit,
  showMimes,
  disabled,
  canSelectFile,
  onSelectFile,
}) => {
  const [file, setFile] = useState<File>()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isVerifing, setIsVerifing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { showError } = useErrorMessage()

  const checkFileMimeType = useCallback(
    (mime: string) => {
      return isMimeCompatible(mime, mimeTypes.split(","))
    },
    [mimeTypes]
  )

  const resetInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    setFile(undefined)
  }, [])

  const handleCancel = useCallback(() => {
    resetInput()
  }, [resetInput])

  const handleFileSelect = useCallback(
    (files: FileList | File[] | null) => {
      if (files && files.length > 0) {
        const file = files[0]
        if (!checkFileMimeType(file.type)) {
          showError("Invalid File", "File type of the selected element is not valid.")
        } else if (!uploadLimit || file.size <= uploadLimit * 1024 * 1024) {
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
    },
    [checkFileMimeType, resetInput, showError, uploadLimit]
  )

  const updateDragOver = useCallback(
    (hasEntered: boolean) => {
      if ((hasEntered && !isDragOver) || (!hasEntered && isDragOver)) {
        setIsDragOver(hasEntered)
      }
    },
    [isDragOver]
  )

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      updateDragOver(true)
    },
    [updateDragOver]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      updateDragOver(false)
    },
    [updateDragOver]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      updateDragOver(true)
    },
    [updateDragOver]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      updateDragOver(false)

      const files = [...e.dataTransfer.files]

      handleFileSelect(files)
    },
    [handleFileSelect, updateDragOver]
  )

  const handleFileProcessing = useCallback(async () => {
    if (file) {
      setIsVerifing(true)
      const canProcede = (await canSelectFile?.(file)) ?? true
      setIsVerifing(false)
      canProcede && onSelectFile(file)
      !canProcede && resetInput()
    } else {
      console.error("No file selected. Cannot continue.")
    }
  }, [file, onSelectFile, canSelectFile, resetInput])

  return (
    <>
      {file ? (
        <div className="pr-3 focus:outline-none">
          <div className="flex items-start">
            <div className="pr-6 text-gray-700 dark:text-gray-400">
              {confirmChildren ? (
                typeof confirmChildren === "function" ? (
                  confirmChildren(file)
                ) : (
                  confirmChildren
                )
              ) : (
                <p>
                  <span>
                    You selected <span className="text-black dark:text-white">{file.name}</span>.{" "}
                  </span>
                  Are you sure you want to upload this file?
                </p>
              )}
            </div>

            <Button
              className="ml-auto p-0"
              aspect="text"
              color="muted"
              onClick={handleCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          </div>
          <div className="mt-4 space-y-5">
            <div>
              <Button
                loading={isVerifing}
                onClick={() => handleFileProcessing()}
                disabled={disabled}
              >
                Continue
              </Button>
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
          <label htmlFor={id} className="block">
            <input
              type="file"
              className="hidden"
              id={id}
              accept={mimeTypes}
              onChange={e => handleFileSelect(e.target.files)}
              disabled={disabled}
              ref={inputRef}
            />
            <div className="flex flex-col items-center space-y-3">
              <DragIcon
                className={classNames(
                  "h-12 w-12 text-gray-500 transition-colors duration-200 dark:text-gray-300",
                  {
                    "text-blue-400 dark:text-blue-300": isDragOver,
                  }
                )}
                aria-hidden
              />

              <span className="font-medium text-gray-600 dark:text-gray-400">
                <span className="text-lg">{label || "Drag here"}</span>
              </span>

              <div
                className={classNames(
                  "flex flex-col items-center",
                  "transition-colors duration-200",
                  {
                    "opacity-20": isDragOver,
                  }
                )}
              >
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  <span className="text-sm font-normal">or</span>
                </span>
                <Button className="mt-6" as="div" lighter>
                  Select
                </Button>

                <small
                  className={classNames(
                    "mt-4 flex flex-col items-center",
                    "text-xs font-medium text-gray-600 dark:text-gray-400"
                  )}
                >
                  {uploadLimit && <span>{uploadLimit}MB</span>}
                  {showMimes && (
                    <span>
                      {mimeTypes
                        .split(",")
                        .map(mime => "." + mime.replace(/^[a-z0-9]+\//, ""))
                        .join(" ")}
                    </span>
                  )}
                </small>
              </div>
            </div>
          </label>
        </div>
      )}
    </>
  )
}

export default FileDrag
