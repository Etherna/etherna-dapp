import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import axios from "axios"

import "./swarm-upload.scss"
import Alert from "@common/Alert"
import Button from "@common/Button"
import ProgressBar from "@common/ProgressBar"
import { gatewayUploadWithProgress, getResourceUrl } from "@utils/swarm"

// cancellation token function
let uploadCancel

const SwarmFileUpload = ({
    buffer,
    filename,
    onFinishedUploading,
    onRemoveFile,
    showImagePreview,
    showConfirmation,
    disabled,
    pinContent,
}) => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [hash, setHash] = useState(undefined)
    const [errorMessage, setErrorMessage] = useState()

    useEffect(() => {
        if (!showConfirmation && !isUploading) {
            handleStartUpload()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showConfirmation])

    const handleStartUpload = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)

        try {
            const hash = await gatewayUploadWithProgress(
                buffer,
                progress => setUploadProgress(progress),
                c => uploadCancel = c,
                pinContent,
            )

            if (hash) {
                setHash(hash)
                onFinishedUploading(hash)
                setUploadProgress(100)
                setIsUploading(false)
            } else {
                // should't go here but in case reset form.
                handleRemoveFile()
            }
        } catch (error) {
            console.error(error)

            if (!axios.isCancel(error)) {
                if (error && error.message === "Network Error") {
                    setErrorMessage("Network Error. Check if the gateway is secured with a SSL certificate.")
                } else {
                    setErrorMessage(error.message)
                }
                setIsUploading(false)
            }
        }
    }

    const handleRemoveFile = () => {
        setIsUploading(false)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)
        onRemoveFile()
    }

    const handleCancel = () => {
        uploadCancel("Upload canceled by user")
        onRemoveFile()
    }

    const askToRemoveFile = () => {
        if (window.confirm("Remove the upload file?")) {
            handleRemoveFile()
        }
    }

    return (
        <div className="mb-4">
            {errorMessage && (
                <>
                    <Alert type="danger" title="Upload error">
                        {errorMessage}
                    </Alert>
                    <Button
                        size="small"
                        aspect="secondary"
                        className="mt-2"
                        action={handleRemoveFile}
                    >
                        Retry
                    </Button>
                </>
            )}
            {showConfirmation && buffer && !isUploading && uploadProgress === 0 && (
                <>
                    <p className="text-gray-700 mb-3">
                        You selected <span className="text-black">{filename}</span>.
                        Do you confirm to upload this file?
                    </p>
                    <Button
                        size="small"
                        aspect="secondary"
                        action={handleCancel}
                        disabled={disabled}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        className="ml-2"
                        action={handleStartUpload}
                        disabled={disabled}
                    >
                        OK
                    </Button>
                </>
            )}
            {isUploading && !hash && (
                <>
                    {
                        uploadProgress < 100
                            ? <p>Uploading ({uploadProgress}%)...</p>
                            : <p>Processing...</p>
                    }
                    <ProgressBar progress={uploadProgress} />
                    <Button
                        size="small"
                        aspect="secondary"
                        className="mt-2"
                        action={handleRemoveFile}
                        disabled={disabled}
                    >
                        Cancel
                    </Button>
                </>
            )}
            {uploadProgress === 100 && hash && (
                <>
                    {showImagePreview ? (
                        <img src={getResourceUrl(hash)} alt="" />
                    ) : (
                        <>
                            <p>Finished upload!</p>
                            <p className="text-gray-700 break-words">
                                <span>
                                    Hash: <br />
                                </span>
                                <strong className="text-black">{hash}</strong>
                            </p>
                        </>
                    )}
                    <Button
                        size="small"
                        aspect="secondary"
                        className="mt-2"
                        action={askToRemoveFile}
                        disabled={disabled}
                    >
                        Remove
                    </Button>
                </>
            )}
        </div>
    )
}

SwarmFileUpload.propTypes = {
    buffer: PropTypes.object.isRequired,
    filename: PropTypes.string,
    onFinishedUploading: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
    showImagePreview: PropTypes.bool,
    showConfirmation: PropTypes.bool,
    disabled: PropTypes.bool,
    pinContent: PropTypes.bool,
}

export default SwarmFileUpload
