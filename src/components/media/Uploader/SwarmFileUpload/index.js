import React, { useState } from "react"
import PropTypes from "prop-types"

import "./swarm-upload.scss"
import Alert from "components/common/Alert"
import Button from "components/common/Button"
import ProgressBar from "components/common/ProgressBar"
import { gatewayUploadWithProgress, getResourceUrl } from "utils/swarm"

const SwarmFileUpload = ({
    file,
    onFinishedUploading,
    onRemoveFile,
    showImagePreview,
    disabled,
    pinContent,
}) => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [hash, setHash] = useState(undefined)
    const [errorMessage, setErrorMessage] = useState()

    const handleStartUpload = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)

        try {
            const hash = await gatewayUploadWithProgress(
                file,
                progress => {
                    setUploadProgress(progress)
                },
                pinContent
            )

            if (hash) {
                setHash(hash)
                onFinishedUploading(hash)
                setUploadProgress(100)
            } else {
                // should't go here but in case reset form.
                handleRemoveFile()
            }
        } catch (error) {
            console.error(error)

            if (error && error.message === "Network Error") {
                setErrorMessage(
                    "Network Error. Check if the gateway is secured with a SSL certificate."
                )
            } else {
                setErrorMessage(error.message)
            }
        }

        setIsUploading(false)
    }

    const handleRemoveFile = () => {
        setIsUploading(false)
        setUploadProgress(0)
        setErrorMessage(undefined)
        setHash(undefined)
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
                    <Button size="small" aspect="secondary" className="mt-2" action={handleRemoveFile}>
                        Retry
                    </Button>
                </>
            )}
            {file && !isUploading && uploadProgress === 0 && (
                <>
                    <p className="text-gray-700">
                        You selected{" "}
                        <span className="text-black">{file.name}</span>. Do you
                        confirm to upload this file?
                    </p>
                    <Button
                        size="small"
                        aspect="secondary"
                        action={handleRemoveFile}
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
                    <p>Uploading ({uploadProgress}%)...</p>
                    <ProgressBar progress={uploadProgress} />
                    <Button
                        size="small"
                        aspect="secondary"
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
    file: PropTypes.object.isRequired,
    onFinishedUploading: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
    showImagePreview: PropTypes.bool,
    disabled: PropTypes.bool,
    pinContent: PropTypes.bool,
}

export default SwarmFileUpload
