import React, { useState, useEffect, useImperativeHandle } from "react"

import FileDrag from "./FileDrag"
import VideoEncoder from "./VideoEncoder"
import SwarmFileUpload from "./SwarmFileUpload"
import { showError } from "@state/actions/modals"
import { getVideoDuration, getVideoResolution } from "@utils/media"
import { isMimeFFMpegEncodable, isMimeMedia, isMimeAudio } from "@utils/mimeTypes"
import { fileReaderPromise } from "@utils/swarm"

type FileUploadFlowProps = {
  hash?: string
  label?: string
  dragLabel?: string
  acceptTypes?: string[]
  sizeLimit?: number
  pinContent?: boolean
  manifest?: string
  path?: string
  disabled?: boolean
  canProcessFile?: boolean
  showImagePreview?: boolean
  onConfirmedProcessing?: () => void
  onHashUpdate: (hash?: string) => void
  onQualityUpdate?: (quality?: string) => void
  onDurationUpdate?: (duration?: number) => void
  onProgressChange?: (progress?: number) => void
  onCancel?: () => void
}

export type FileUploadHandlers = {
  clear: () => void
}

const FileUploadFlow = React.forwardRef<FileUploadHandlers, FileUploadFlowProps>(({
  hash: previusHash,
  label,
  dragLabel,
  acceptTypes = ["mime"],
  sizeLimit = 100,
  pinContent = false,
  manifest,
  path,
  disabled,
  canProcessFile = true,
  showImagePreview = false,
  onConfirmedProcessing,
  onHashUpdate,
  onQualityUpdate,
  onDurationUpdate,
  onProgressChange,
  onCancel,
}, ref) => {
  const [buffer, setBuffer] = useState<ArrayBuffer>()
  const [file, setFile] = useState<File>()
  const [hash, setHash] = useState(previusHash)
  const [duration, setDuration] = useState<number>()
  const [quality, setQuality] = useState<string>()
  const [contentType, setContentType] = useState<string>()

  const status = hash ? "preview"
    : file === undefined ? "select"
    : file !== undefined && buffer === undefined ? "encode"
    : file !== undefined && buffer !== undefined ? "upload"
    : ""

  useEffect(() => {
    previusHash !== hash && setHash(previusHash)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previusHash])

  useEffect(() => {
    onHashUpdate && onHashUpdate(hash)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  useEffect(() => {
    updateVideoMetadata()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, buffer])

  useEffect(() => {
    onDurationUpdate && onDurationUpdate(duration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  useEffect(() => {
    onQualityUpdate && onQualityUpdate(quality)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality])

  useImperativeHandle(ref, () => ({
    clear() {
      setBuffer(undefined)
      setFile(undefined)
      setHash(undefined)
      setDuration(undefined)
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

  /**
   * @param {File} file
   */
  const handleSelectFile = async (file: File|null|undefined) => {
    if (!file) {
      showError("Error", "The file selected is not supported")
      return
    }

    setContentType(file.type)

    if (!isMimeFFMpegEncodable(file.type)) {
      const buffer = await fileReaderPromise(file)
      setBuffer(buffer)
    } else {
      if (isMimeAudio(file.type)) setContentType("audio/mpeg")
      else setContentType("video/mp4")
    }

    setFile(file)
  }

  const updateVideoMetadata = async () => {
    if (!file) return
    if (!buffer && !isMimeFFMpegEncodable(file.type)) return
    if (!isMimeMedia(file.type)) return

    try {
      const duration = await getVideoDuration(buffer || file)
      setDuration(duration)
    } catch (error) {
      console.error(error)
      showError("Metadata error", error.message || "Cannot retrieve video duration")
    }

    try {
      const quality = await getVideoResolution(buffer || file)
      setQuality(`${quality}p`)
    } catch (error) {
      console.error(error)
      showError("Metadata error", error.message || "Cannot retrieve video quality")
    }
  }

  const handleCancel = () => {
    setBuffer(undefined)
    setFile(undefined)
    setHash(undefined)
    setDuration(undefined)
    setContentType(undefined)
    onCancel && onCancel()
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
      {(status === "upload" || status === "preview") && (
        <SwarmFileUpload
          hash={hash}
          buffer={buffer!}
          manifest={manifest}
          path={path}
          contentType={contentType!}
          filename={file && file.name}
          showConfirmation={!isMimeFFMpegEncodable(file?.type || "")}
          showImagePreview={showImagePreview}
          disabled={disabled}
          pinContent={pinContent}
          canUpload={canProcessFile}
          onConfirmUpload={onConfirmedProcessing}
          onProgressChange={onProgressChange}
          onFinishedUploading={hash => setHash(hash)}
          onRemoveFile={handleCancel}
        />
      )}
    </>
  )
})

export default FileUploadFlow