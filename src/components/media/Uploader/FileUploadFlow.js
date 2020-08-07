import React, { useState, useEffect, useImperativeHandle } from "react"

import FileDrag from "./FileDrag"
import VideoEncoder from "./VideoEncoder"
import SwarmFileUpload from "./SwarmFileUpload"
import { getVideoDuration, getVideoResolution } from "@utils/media"
import { isMimeFFMpegEncodable, isMimeImage, isMimeMedia } from "@utils/mimeTypes"
import { showError } from "@state/actions/modals"
import { fileReaderPromise } from "@utils/swarm"

const FileUploadFlow = ({
    label,
    dragLabel,
    acceptTypes = ["mime"],
    sizeLimit = 100,
    pinContent = false,
    manifest,
    path,
    disabled,
    canProcessFile = true,
    onConfirmedProcessing,
    onHashUpdate,
    onQualityUpdate,
    onDurationUpdate,
    onProgressChange,
    onCancel,
}, ref) => {
    const [buffer, setBuffer] = useState(undefined)
    const [file, setFile] = useState(undefined)
    const [hash, setHash] = useState(undefined)
    const [duration, setDuration] = useState(undefined)
    const [quality, setQuality] = useState(undefined)

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
        }
    }))

    const getMime = () => {
        let mime = []
        if (acceptTypes.indexOf("video") >= 0) {
            mime = mime.concat(["video/mp4", "video/m4v", "video/avi", "video/webm"])
        }
        if (acceptTypes.indexOf("audio") >= 0) {
            mime = mime.concat(["audio/mp3", "audio/m4a"])
        }
        if (acceptTypes.indexOf("image") >= 0) {
            mime = mime.concat(["image/png", "image/jpeg"])
        }
        return mime.join(',')
    }

    /**
     * @param {File} file
     */
    const handleSelectFile = async file => {
        if (!file) {
            showError("Error", "The file selected is not supported")
            return
        }

        if (!isMimeFFMpegEncodable(file.type)) {
            const buffer = await fileReaderPromise(file)
            setBuffer(buffer)
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
        onCancel && onCancel()
    }

    return (
        <>
            <label htmlFor="video">{label}</label>
            {file === undefined && (
                <FileDrag
                    id={`${label}-input`}
                    label={dragLabel}
                    mimeTypes={getMime()}
                    onSelectFile={handleSelectFile}
                    disabled={disabled}
                    uploadLimit={sizeLimit}
                />
            )}
            {file !== undefined && buffer === undefined && (
                <VideoEncoder
                    file={file}
                    canEncode={canProcessFile}
                    onConfirmEncode={onConfirmedProcessing}
                    onEncodingComplete={buffer => setBuffer(buffer)}
                    onCancel={handleCancel}
                />
            )}
            {file !== undefined && buffer !== undefined && (
                <SwarmFileUpload
                    buffer={buffer}
                    manifest={manifest}
                    path={path}
                    contentType={file.type}
                    filename={file.name}
                    showConfirmation={!isMimeFFMpegEncodable(file.type)}
                    showImagePreview={isMimeImage(file.type)}
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
}

export default React.forwardRef(FileUploadFlow)