import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { createFFmpeg } from "@ffmpeg/ffmpeg"

import "./video-encoder.scss"

import Button from "@components/common/Button"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { showError } from "@state/actions/modals"
import { isMimeCompatible } from "@utils/mimeTypes"
import { fileReaderPromise } from "@utils/swarm"

const ffmpeg = createFFmpeg({
  log: process.env.NODE_ENV !== "production",
})

/**
 * @param {object} props
 * @param {File} props.file
 * @param {Function} onCancel
 * @param {Function} onEncodingComplete
 */
const VideoEncoder = ({ file, canEncode, onConfirmEncode, onEncodingComplete, onCancel }) => {
  const [confirmed, setConfirmed] = useState(false)
  const [isEncoding, setIsEncoding] = useState(false)
  const isMpegVideo = isMimeCompatible(file.type, ["video/mp4", "video/m4v"])

  useEffect(() => {
    // Clear previus cache
    try {
      ffmpeg.remove("output.mp4")
    } catch {}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    confirmed && canEncode && startEncoding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, canEncode])

  const startEncoding = async () => {
    setIsEncoding(true)

    const ext = file.name.match(/\.[a-z0-9]*$/)[0]

    try {
      await ffmpeg.load()
      await ffmpeg.write(`input${ext}`, file)
      await ffmpeg.transcode(`input${ext}`, "output.mp4", "-threads 2")
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

  const confirmEncode = () => {
    setConfirmed(true)
    onConfirmEncode && onConfirmEncode()
  }

  const upload = async () => {
    const buffer = await fileReaderPromise(file)
    onEncodingComplete(buffer)

    onConfirmEncode && onConfirmEncode()
  }

  return (
    <>
      {file && !isEncoding && (
        <>
          <p className="text-gray-700 mb-3">
            You selected <span className="text-black">{file.name}</span>. Do you confirm to upload
            this file?
          </p>
          <Button size="small" aspect="secondary" action={onCancel}>
            Cancel
          </Button>
          <Button size="small" className="ml-2" action={confirmEncode}>
            Encode and Upload
          </Button>
          {isMpegVideo && (
            <Button size="small" className="ml-2" action={upload}>
              Upload
            </Button>
          )}
        </>
      )}
      {confirmed && !canEncode && (
        <p className="text-gray-700 mb-3">Pending encoding...</p>
      )}
      {isEncoding && (
        <div className="video-encoder">
          <p className="leading-loose">
            Encoding {file.name} <br />
            This process might take a while...
          </p>
          <div className="flex flex-col items-center mt-4">
            <Spinner className="mx-auto" width="30" alt="" />
            <Button size="small" aspect="secondary" className="mt-4" action={onCancel}>
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
  canEncode: PropTypes.bool,
  onConfirmEncode: PropTypes.func,
  onEncodingComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

VideoEncoder.defaultProps = {
  canEncode: true,
}

export default VideoEncoder
