import React, { useState } from "react"
import PropTypes from "prop-types"

import "./video-upload.scss"
import Alert from "../../../common/Alert"
import Button from "../../../common/Button"
import ProgressBar from "../../../common/ProgressBar"
import { uploadResourceToSwarm, fileReaderPromise } from "../../../../utils/swarm"

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

        const imageBuffer = await fileReaderPromise(file)
        const videoData = new Blob([new Uint8Array(imageBuffer)])

        try {
            const vidObject = await uploadResourceToSwarm(videoData, progress => {
                setUploadProgress(progress)
            })
            setUploadProgress(100)
            setIsUploading(false)

            console.log(vidObject);

            const hash = vidObject[0].contentUrl["/"]

            setHash(hash)
            onFinishedUploading(hash)
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
            {errorMessage &&
                <Alert style="danger" title="Upload error">{errorMessage}</Alert>
            }
            {(file && !isUploading && uploadProgress == 0) &&
                <>
                    <p className="text-gray-700">
                        You selected <span className="text-black">{file.name}</span>. Do you confirm to upload this video?
                    </p>
                    <Button size="small" style="secondary" action={handleRemoveVideo}>
                        Cancel
                    </Button>
                    <Button size="small" className="ml-2" action={handleStartUpload}>
                        OK
                    </Button>
                </>
            }
            {(isUploading && uploadProgress < 100) &&
                <>
                    <p>Uploading ({uploadProgress}%)...</p>
                    <ProgressBar progress={uploadProgress} />
                    <Button size="small" style="secondary" action={handleRemoveVideo}>
                        Cancel
                    </Button>
                </>
            }
            {uploadProgress === 100 &&
                <>
                    <p>Finished upload!</p>
                    <p className="text-gray-700">
                        Video hash: <strong className="text-black">{hash}</strong>
                    </p>
                </>
            }
        </div>
    )
}

VideoUpload.propTypes = {
    file: PropTypes.object.isRequired,
    onFinishedUploading: PropTypes.func.isRequired,
    onRemoveVideo: PropTypes.func.isRequired,
}

export default VideoUpload