/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useState, useEffect, useMemo } from "react"
import { createFFmpeg } from "@ffmpeg/ffmpeg"

import "./video-encoder.scss"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

import Button from "@common/Button"
import { useErrorMessage } from "@state/hooks/ui"
import { fileToUint8Array } from "@utils/buffer"

type VideoEncoderProps = {
  file: File
  canEncode: boolean
  onEncodingComplete: (buffer: ArrayBuffer) => Promise<void>
  onCancel?: () => void
}

const VideoEncoder: React.FC<VideoEncoderProps> = ({
  file,
  canEncode = true,
  onEncodingComplete,
  onCancel
}) => {
  const ffmpeg = useMemo(() => {
    return createFFmpeg({
      log: import.meta.env.DEV,
      progress: ({ ratio }) => {
        console.log("progress", ratio)
      }
    })
  }, [])
  const [isEncoding, setIsEncoding] = useState(false)

  const { showError } = useErrorMessage()

  useEffect(() => {
    // Clear previus cache
    clearCache()
    return () => clearCache()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    canEncode && !isEncoding && startEncoding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEncode])

  const clearCache = () => {
    try {
      ffmpeg.FS("unlink", "output.mp4")
    } catch { }
  }

  const startEncoding = async () => {
    setIsEncoding(true)

    const ext = file.name.match(/\.[a-z0-9]*$/)![0]

    console.log("file", file)


    try {
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load()
      }

      console.log("load")

      const inputPath = `input${ext}`

      // copy input file
      ffmpeg.FS("writeFile", inputPath, await fileToUint8Array(file))
      console.log("copy")

      // run ecoder
      await ffmpeg.run("-i", inputPath, "output.mp4")
      console.log("output")

      // get output buffer
      const data = ffmpeg.FS("readFile", "output.mp4")
      console.log("data")

      // clear cache
      ffmpeg.FS("unlink", "output.mp4")
      console.log("unlink")

      onEncodingComplete(data.buffer)
    } catch (error) {
      console.error(error)

      showError("Encoding Error", error.message)
      onCancel?.()
    }
  }

  if (!file) return null

  return (
    <>
      {!canEncode && (
        <p className="video-encoder-text">Pending encoding...</p>
      )}
      {isEncoding && (
        <div className="video-encoder">
          <p className="video-encoder-text">
            Encoding {file.name} <br />
            This process might take a while...
          </p>
          <div className="flex flex-col items-center mt-4">
            <Spinner className="mx-auto" width="30" />
            <Button size="small" aspect="secondary" className="mt-4" action={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoEncoder
