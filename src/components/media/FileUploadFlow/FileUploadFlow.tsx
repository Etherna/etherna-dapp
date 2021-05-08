import React, { useState, useImperativeHandle } from "react"

import FileDrag from "../FileDrag"
import FilePreview from "../FilePreview"
import FileUpload from "../FileUpload"
import VideoEncoder from "../VideoEncoder"
import { showError } from "@state/actions/modals"
import { isMimeFFMpegEncodable, isMimeAudio } from "@utils/mimeTypes"
import { fileToBuffer } from "@utils/buffer"
import useSelector from "@state/useSelector"

type FileUploadFlowProps = {
  reference?: string
  label?: string
  dragLabel?: string
  acceptTypes?: ("video" | "audio" | "image")[]
  sizeLimit?: number
  disabled?: boolean
  canProcessFile?: boolean
  uploadHandler: (buffer: ArrayBuffer) => Promise<string>
  onConfirmedProcessing?: () => void
  onManifestUpdate?: (manifest?: string) => void
  onFileSelected?: (file: File) => void
  onCancel?: () => void
}

export type FileUploadFlowHandlers = {
  clear: () => void
}

const FileUploadFlow = React.forwardRef<FileUploadFlowHandlers, FileUploadFlowProps>(({
  reference,
  label,
  dragLabel,
  acceptTypes = [],
  sizeLimit = 100,
  disabled,
  canProcessFile = true,
  uploadHandler,
  onConfirmedProcessing,
  onManifestUpdate,
  onFileSelected,
  onCancel,
}, ref) => {
  const [buffer, setBuffer] = useState<ArrayBuffer>()
  const [file, setFile] = useState<File>()
  const [contentType, setContentType] = useState<string>()

  const { beeClient } = useSelector(state => state.env)

  const status = reference ? "preview"
    : file === undefined ? "select"
      : file !== undefined && buffer === undefined ? "encode"
        : file !== undefined && buffer !== undefined ? "upload"
          : ""

  useImperativeHandle(ref, () => ({
    clear() {
      setBuffer(undefined)
      setFile(undefined)
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

  const getFallbackMime = () => {
    if (acceptTypes.indexOf("video") >= 0) {
      return "video/mp4"
    }
    if (acceptTypes.indexOf("image") >= 0) {
      return "image/jpeg"
    }
    if (acceptTypes.indexOf("audio") >= 0) {
      return "audio/mp3"
    }
  }

  const handleSelectFile = async (file: File | null | undefined) => {
    if (!file) {
      showError("Error", "The file selected is not supported")
      return
    }

    setContentType(file.type)

    if (!isMimeFFMpegEncodable(file.type)) {
      const buffer = await fileToBuffer(file)
      setBuffer(buffer)
    } else {
      if (isMimeAudio(file.type)) setContentType("audio/mpeg")
      else setContentType("video/mp4")
    }

    setFile(file)
    onFileSelected?.(file)
  }

  const handleCancel = () => {
    setBuffer(undefined)
    setFile(undefined)
    setContentType(undefined)
    onCancel?.()
  }

  return (
    <>
      <label htmlFor="video">{label}</label>
      {status === "select" && (
        <FileDrag
          id={`${label}-input`}
          label={dragLabel}
          mimeTypes={getMime()}
          onSelectFile={handleSelectFile}
          disabled={disabled}
          uploadLimit={sizeLimit}
        />
      )}
      {status === "encode" && (
        <VideoEncoder
          file={file!}
          canEncode={canProcessFile}
          onConfirmEncode={onConfirmedProcessing}
          onEncodingComplete={buffer => setBuffer(buffer)}
          onCancel={handleCancel}
        />
      )}
      {status === "upload" && (
        <FileUpload
          buffer={buffer!}
          filename={file?.name ?? "[...]"}
          showConfirmation={!isMimeFFMpegEncodable(file?.type || "")}
          disabled={disabled}
          canUpload={canProcessFile}
          uploadHandler={uploadHandler}
          onConfirmUpload={onConfirmedProcessing}
          onFinishedUploading={hash => onManifestUpdate?.(hash)}
          onCancel={handleCancel}
        />
      )}
      {status === "preview" && (
        <FilePreview
          contentType={contentType ?? getFallbackMime()}
          previewUrl={beeClient.getFileUrl(reference ?? "")}
        />
      )}
    </>
  )
})

export default FileUploadFlow
