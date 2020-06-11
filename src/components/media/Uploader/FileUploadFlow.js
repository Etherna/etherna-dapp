import React, { useState, useEffect, useImperativeHandle } from "react"
import PropTypes from "prop-types"

import FileDrag from "./FileDrag"
import VideoEncoder from "./VideoEncoder"
import SwarmFileUpload from "./SwarmFileUpload"
import { getVideoDuration } from "@utils/media"
import { isMimeFFMpegEncodable, isMimeImage, isMimeMedia } from "@utils/mimeTypes"
import { showError } from "@state/actions/modals"
import { fileReaderPromise } from "@utils/swarm"

const FileUploadFlow = ({
    label,
    dragLabel,
    acceptTypes,
    sizeLimit,
    pinContent,
    disabled,
    onHashUpdate,
    onDurationUpdate
}, ref) => {
    const [buffer, setBuffer] = useState(undefined)
    const [file, setFile] = useState(undefined)
    const [hash, setHash] = useState(undefined)
    const [duration, setDuration] = useState(undefined)

    useEffect(() => {
        onHashUpdate && onHashUpdate(hash)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash])

    useEffect(() => {
        updateDuration()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file, buffer])

    useEffect(() => {
        onDurationUpdate && onDurationUpdate(duration)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration])

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
            mime = mime.concat(["video/mp4", "video/x-m4v", "video/avi", "video/*"])
        }
        if (acceptTypes.indexOf("audio") >= 0) {
            mime = mime.concat(["audio/mp3", "audio/x-m4a", "audio/*"])
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

    const updateDuration = async () => {
        if (!file) return
        if (!buffer && isMimeFFMpegEncodable(file.type)) return
        if (!isMimeMedia(file.type)) return

        try {
            const duration = await getVideoDuration(buffer || file)
            setDuration(duration)
        } catch (error) {
            console.error(error)
            showError("Metadata error", error.message || "Cannot retrieve video duration")
        }
    }

    const handleCancel = () => {
        setBuffer(undefined)
        setFile(undefined)
        setHash(undefined)
        setDuration(undefined)
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
                    onEncodingComplete={buffer => setBuffer(buffer)}
                    onCancel={handleCancel}
                />
            )}
            {file !== undefined && buffer !== undefined && (
                <SwarmFileUpload
                    buffer={buffer}
                    filename={file.name}
                    onFinishedUploading={hash => setHash(hash)}
                    onRemoveFile={handleCancel}
                    showConfirmation={!isMimeFFMpegEncodable(file.type)}
                    showImagePreview={isMimeImage(file.type)}
                    disabled={disabled}
                    pinContent={pinContent}
                />
            )}
        </>
    )
}

FileUploadFlow.propTypes = {
    ref: PropTypes.object,
    label: PropTypes.string.isRequired,
    dragLabel: PropTypes.string,
    acceptTypes: PropTypes.arrayOf(PropTypes.string),
    sizeLimit: PropTypes.number,
    pinContent: PropTypes.bool,
    disabled: PropTypes.bool,
    onHashUpdate: PropTypes.func.isRequired,
    onDurationUpdate: PropTypes.func,
}

FileUploadFlow.defaultProps = {
    mime: ["video"],
    sizeLimit: 100,
    pinContent: false,
}

export default React.forwardRef(FileUploadFlow)