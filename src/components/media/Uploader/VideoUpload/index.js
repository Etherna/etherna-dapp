import React, { useState } from "react"
import PropTypes from "prop-types"

import "./video-upload.scss"
import Alert from "@common/Alert"
import Button from "@common/Button"
import ProgressBar from "@common/ProgressBar"
import { uploadVideoToSwarm } from "@utils/swarm"

const VideoUpload = ({ file, onFinishedUploading, onRemoveVideo }) => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [hash, setHash] = useState(undefined)
    const [errorMessage, setErrorMessage] = useState(undefined)

    const handleStartUpload = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)

        try {
            const hash = await uploadVideoToSwarm(file, progress => {
                setUploadProgress(progress)
            })
            setUploadProgress(100)
            setIsUploading(false)

            console.log(hash)

            if (hash) {
                setHash(hash)
                onFinishedUploading(hash)
            }
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        }
    }

    const handleRemoveVideo = () => {
        setIsUploading(false)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)
        onRemoveVideo()
    }

    return (
        <div className="mb-4">
            {errorMessage && (
                <Alert type="danger" title="Upload error">
                    {errorMessage}
                </Alert>
            )}
            {file && !isUploading && uploadProgress === 0 && (
                <>
                    <p className="text-gray-700">
                        You selected{" "}
                        <span className="text-black">{file.name}</span>. Do you
                        confirm to upload this video?
                    </p>
                    <Button
                        size="small"
                        aspect="secondary"
                        action={handleRemoveVideo}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        className="ml-2"
                        action={handleStartUpload}
                    >
                        OK
                    </Button>
                </>
            )}
            {isUploading && !hash && (
                <>
                    <p>Uploading ({uploadProgress}%)...</p>
                    <ProgressBar progress={uploadProgress} />
                    <Button
                        size="small"
                        aspect="secondary"
                        action={handleRemoveVideo}
                    >
                        Cancel
                    </Button>
                </>
            )}
            {uploadProgress === 100 && hash && (
                <>
                    <p>Finished upload!</p>
                    <p className="text-gray-700">
                        Video hash:{" "}
                        <strong className="text-black">{hash}</strong>
                    </p>
                </>
            )}
        </div>
    )
}

VideoUpload.propTypes = {
    file: PropTypes.object.isRequired,
    onFinishedUploading: PropTypes.func.isRequired,
    onRemoveVideo: PropTypes.func.isRequired,
}

export default VideoUpload
