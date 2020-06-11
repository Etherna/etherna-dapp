import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { createFFmpeg } from "@ffmpeg/ffmpeg"

import "./video-encoder.scss"
import Button from "@components/common/Button"
import { showError } from "@state/actions/modals"

const ffmpeg = createFFmpeg({
    log: process.env.NODE_ENV !== "production",
})

const VideoEncoder = ({ file, onEncodingComplete, onCancel }) => {
    const [isEncoding, setIsEncoding] = useState(false)

    useEffect(() => {
        // Clear previus cache
        try { ffmpeg.remove("output.mp4") } catch {}

        return () => {
            // Clear cache in case of cancel/error
            try { ffmpeg.remove("output.mp4") } catch {}
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startEncoding = async () => {
        setIsEncoding(true)

        try {
            await ffmpeg.load()
            await ffmpeg.write(file.name, file)
            await ffmpeg.transcode(file.name, "output.mp4", "-threads 2")
            const data = ffmpeg.read("output.mp4")
            ffmpeg.remove("output.mp4")

            setIsEncoding(false)
            onEncodingComplete(data.buffer)
        } catch (error) {
            console.error(error)

            showError("Encoding Error", error.message)
            onCancel()
        }
    }

    return (
        <>
            {file && !isEncoding && (
                <>
                    <p className="text-gray-700 mb-3">
                        You selected <span className="text-black">{file.name}</span>.
                        Do you confirm to encode and upload this file?
                    </p>
                    <Button
                        size="small"
                        aspect="secondary"
                        action={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        className="ml-2"
                        action={startEncoding}
                    >
                        OK
                    </Button>
                </>
            )}
            {isEncoding && (
                <div className="video-encoder">
                    <p className="leading-loose">
                        Encoding {file.name} <br/>
                        This process might take a while...
                    </p>
                    <div className="flex flex-col items-center mt-4">
                        <img
                            src={require("@svg/animated/spinner.svg")}
                            className="mx-auto"
                            width="30"
                            alt=""
                        />
                        <Button
                            size="small"
                            aspect="secondary"
                            className="mt-4"
                            action={onCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}

VideoEncoder.propTypes = {
    file: PropTypes.object.isRequired,
    onEncodingComplete: PropTypes.func.isRequired,
}

export default VideoEncoder