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

import React, { useCallback, useEffect, useImperativeHandle, useState } from "react"
import { fileToBuffer } from "@etherna/sdk-js/utils"

import FileDrag from "./FileDrag"
import FileUpload from "./FileUpload"
import { Label } from "@/components/ui/display"

import type { FilePreviewRenderProps } from "@/types/file-preview"

type FileUploadFlowProps = {
  children?: React.ReactNode | ((props: FilePreviewRenderProps) => React.ReactNode)
  reference?: string
  label?: string
  dragLabel?: string
  acceptTypes?: ("video" | "audio" | "image")[]
  sizeLimit?: number
  disabled?: boolean
  canProcessFile?: boolean
  fileDragPortal?: string
  uploadHandler: (buffer: ArrayBuffer) => Promise<string>
  onManifestUpdate?: (manifest?: string) => void
  onFileSelected?: (file: File) => void
  canSelectFile?: (file: File) => Promise<boolean>
  onCancel?: () => void
  onUploadError: (errorMessage: string) => void
}

export type FileUploadFlowHandlers = {
  clear: () => void
}

const FileUploadFlow = React.forwardRef<FileUploadFlowHandlers, FileUploadFlowProps>(
  (
    {
      children,
      reference,
      label,
      dragLabel,
      acceptTypes = [],
      sizeLimit = 100,
      disabled,
      canProcessFile = true,
      fileDragPortal,
      uploadHandler,
      onManifestUpdate,
      onFileSelected,
      canSelectFile,
      onCancel,
      onUploadError,
    },
    ref
  ) => {
    const [buffer, setBuffer] = useState<ArrayBuffer>()
    const [status, setStatus] = useState<"select" | "upload" | "preview">(
      reference ? "preview" : "select"
    )

    useEffect(() => {
      setStatus(status => {
        if (reference && status !== "preview") return "preview"
        if (!reference && status === "preview") return "select"
        return status
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reference])

    useImperativeHandle(ref, () => ({
      clear() {
        setBuffer(undefined)
        setStatus("select")
      },
    }))

    const getMime = useCallback(() => {
      let mime: string[] = []
      if (acceptTypes.indexOf("video") >= 0) {
        mime = mime.concat(["video/mp4"])
      }
      if (acceptTypes.indexOf("audio") >= 0) {
        mime = mime.concat(["audio/mp3"])
      }
      if (acceptTypes.indexOf("image") >= 0) {
        mime = mime.concat(["image/png", "image/jpeg"])
      }
      return mime.join(",")
    }, [acceptTypes])

    const handleSelectFile = useCallback(
      async (file: File) => {
        const canUpload = canSelectFile ? await canSelectFile(file) : true

        if (!canUpload) {
          setBuffer(undefined)
          setStatus("select")
          return
        }

        const buffer = await fileToBuffer(file)
        setBuffer(buffer)
        onFileSelected?.(file)
        setStatus("upload")
      },
      [canSelectFile, onFileSelected]
    )

    const handleCancel = useCallback(() => {
      setBuffer(undefined)
      setStatus("select")
      onCancel?.()
    }, [onCancel])

    const onUploadFinished = useCallback(
      (hash: string) => {
        onManifestUpdate?.(hash)
        setStatus("preview")
      },
      [onManifestUpdate]
    )

    return (
      <>
        {label && <Label>{label}</Label>}

        <div className="rounded bg-gray-900/5 p-4 dark:bg-gray-100/5">
          {status === "select" && (
            <FileDrag
              id={`${label || "new"}-input`}
              portal={fileDragPortal}
              label={dragLabel}
              mimeTypes={getMime()}
              disabled={disabled}
              uploadLimit={sizeLimit}
              onSelectFile={handleSelectFile}
            />
          )}
          {status === "upload" && (
            <FileUpload
              buffer={buffer!}
              disabled={disabled}
              canUpload={canProcessFile}
              uploadHandler={uploadHandler}
              onUploadFinished={onUploadFinished}
              onCancel={handleCancel}
              onUploadError={onUploadError}
            >
              {children}
            </FileUpload>
          )}
          {status === "preview" && <>{typeof children === "function" ? children({}) : children}</>}
        </div>
      </>
    )
  }
)

export default FileUploadFlow
