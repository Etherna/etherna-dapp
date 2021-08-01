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

import React, { useState, useImperativeHandle, useEffect } from "react"

import "./file-upload-flow.scss"

import { FilePreviewRenderProps } from "./types"
import FileDrag from "../FileDrag"
import FileUpload from "../FileUpload"
import VideoEncoder from "../VideoEncoder"
import Label from "@common/Label"
import { useErrorMessage } from "@state/hooks/ui"
import { fileToBuffer } from "@utils/buffer"
import { isMimeFFMpegEncodable, isMimeAudio, isMimeWebCompatible } from "@utils/mimeTypes"
import { getVideoDuration, getVideoResolution } from "@utils/media"

type FileUploadFlowProps = {
  children?: React.ReactChild | ((props: FilePreviewRenderProps) => React.ReactChild)
  reference?: string
  label?: string
  dragLabel?: string
  acceptTypes?: ("video" | "audio" | "image")[]
  sizeLimit?: number
  disabled?: boolean
  canProcessFile?: boolean
  uploadHandler: (buffer: ArrayBuffer) => Promise<string>
  onManifestUpdate?: (manifest?: string) => void
  onFileSelected?: (file: File) => void
  onEncodingComplete?: (contentType: string, duration: number, quality: number) => void
  onCancel?: () => void
}

export type FileUploadFlowHandlers = {
  clear: () => void
}

const FileUploadFlow = React.forwardRef<FileUploadFlowHandlers, FileUploadFlowProps>(({
  children,
  reference,
  label,
  dragLabel,
  acceptTypes = [],
  sizeLimit = 100,
  disabled,
  canProcessFile = true,
  uploadHandler,
  onEncodingComplete,
  onManifestUpdate,
  onFileSelected,
  onCancel,
}, ref) => {
  const [buffer, setBuffer] = useState<ArrayBuffer>()
  const [file, setFile] = useState<File>()
  const [contentType, setContentType] = useState<string>()
  const [status, setStatus] = useState<"select" | "encode" | "upload" | "preview">(reference ? "preview" : "select")

  const { showError } = useErrorMessage()

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
      setFile(undefined)
      setStatus("select")
    },
  }))

  const getMime = () => {
    let mime: string[] = []
    if (acceptTypes.indexOf("video") >= 0) {
      mime = mime.concat(["video/mp4", "video/m4v", "video/avi", "video/webm"])
    }
    if (acceptTypes.indexOf("audio") >= 0) {
      mime = mime.concat(["audio/mp3", "audio/m4a"])
    }
    if (acceptTypes.indexOf("image") >= 0) {
      mime = mime.concat(["image/png", "image/jpeg"])
    }
    return mime.join(",")
  }

  const handleSelectFile = async (file: File, encode: boolean) => {
    if (!file) {
      showError("Error", "The file selected is not supported")
      return
    }

    setContentType(() => {
      if (!isMimeWebCompatible(file.type)) {
        if (isMimeAudio(file.type)) return "audio/mpeg"
        else return "video/mp4"
      }
      return file.type
    })

    // we need a buffer and encoding return a buffer.
    // if we don't encode we need to get the buffer from file.
    if (!encode) {
      const buffer = await fileToBuffer(file)
      setBuffer(buffer)
    }

    setFile(file)
    onFileSelected?.(file)

    setStatus(encode ? "encode" : "upload")
  }

  const handleCancel = () => {
    setBuffer(undefined)
    setFile(undefined)
    setContentType(undefined)
    setStatus("select")
    onCancel?.()
  }

  const handleCompleteEncoding = async (buffer: ArrayBuffer) => {
    setBuffer(buffer)

    const duration = await getVideoDuration(buffer)
    const quality = await getVideoResolution(buffer)

    onEncodingComplete?.(contentType!, duration, quality)

    setStatus("upload")
  }

  const onUploadFinished = (hash: string) => {
    onManifestUpdate?.(hash)
    setStatus("preview")
  }

  return (
    <>
      {label && (
        <Label>{label}</Label>
      )}

      <div className="file-upload-flow">
        {status === "select" && (
          <FileDrag
            id={`${label}-input`}
            label={dragLabel}
            mimeTypes={getMime()}
            disabled={disabled}
            uploadLimit={sizeLimit}
            canEncodeFile={type => isMimeFFMpegEncodable(type)}
            onSelectFile={handleSelectFile}
          />
        )}
        {status === "encode" && (
          <VideoEncoder
            file={file!}
            canEncode={canProcessFile}
            onEncodingComplete={handleCompleteEncoding}
            onCancel={handleCancel}
          />
        )}
        {status === "upload" && (
          <FileUpload
            children={children}
            buffer={buffer!}
            disabled={disabled}
            canUpload={canProcessFile}
            uploadHandler={uploadHandler}
            onUploadFinished={onUploadFinished}
            onCancel={handleCancel}
          />
        )}
        {status === "preview" && (
          <>
            {typeof children === "function"
              ? children({})
              : children
            }
          </>
        )}
      </div>
    </>
  )
})

export default FileUploadFlow
