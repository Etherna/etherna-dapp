import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import axios from "axios"

import "./swarm-upload.scss"
import Alert from "@common/Alert"
import Button from "@common/Button"
import ProgressBar from "@common/ProgressBar"
import { getResourceUrl, uploadManifestData } from "@utils/swarm"
import { Link } from "react-router-dom"
import routes from "@routes"

// cancellation token function
let uploadCancel

const SwarmFileUpload = ({
    buffer,
    filename,
    manifest,
    contentType,
    path,
    showImagePreview,
    showConfirmation,
    disabled,
    pinContent,
    canUpload,
    onConfirmUpload,
    onProgressChange,
    onFinishedUploading,
    onRemoveFile,
}) => {
    const [isUploading, setIsUploading] = useState(false)
    const [confirmed, setConfirmed] = useState(!showConfirmation && !isUploading)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [hash, setHash] = useState(undefined)
    const [errorMessage, setErrorMessage] = useState()

    useEffect(() => {
        if (confirmed && canUpload) {
            handleStartUpload()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmed, canUpload])

    useEffect(() => {
        onProgressChange && onProgressChange(uploadProgress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadProgress])

    const handleStartUpload = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)

        try {
            const hash = await uploadManifestData(
                manifest,
                path,
                buffer,
                contentType,
                {
                    cancelTokenCallback: c => uploadCancel = c,
                    progressCallback: p => setUploadProgress(p),
                    pinContent
                }
            )

            if (hash) {
                setHash(hash)
                onFinishedUploading(hash)
                setUploadProgress(100)
                setIsUploading(false)
                setConfirmed(false)
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
            }
            setIsUploading(false)
        }
    }

    const confirmUpload = () => {
        setConfirmed(true)
        onConfirmUpload && onConfirmUpload()
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
                        action={confirmUpload}
                        disabled={disabled}
                    >
                        OK
                    </Button>
                </>
            )}
            {confirmed && !canUpload && (
                <p className="text-gray-700 mb-3">
                    Pending upload...
                </p>
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
                                <small>
                                    Preview: <br/>
                                    <Link to={routes.getVideoLink(hash, path)} target="_blank">
                                        {routes.getVideoLink(hash, path)}
                                    </Link>
                                </small>
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
    manifest: PropTypes.string,
    path: PropTypes.string,
    contentType: PropTypes.string.isRequired,
    showImagePreview: PropTypes.bool,
    showConfirmation: PropTypes.bool,
    disabled: PropTypes.bool,
    pinContent: PropTypes.bool,
    canUpload: PropTypes.bool,
    onConfirmUpload: PropTypes.func,
    onProgressChange: PropTypes.func,
    onFinishedUploading: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
}

SwarmFileUpload.defaultProps = {
    pinContent: false,
    canUpload: true
}

export default SwarmFileUpload
