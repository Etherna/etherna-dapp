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
 */

import http from "./request"

/**
 * Get a video duration
 *
 * @param videoObj Video file object or encoded buffer
 * @returns Duration in seconds
 */
export const getVideoDuration = (videoObj: string | File | ArrayBuffer) => {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onerror = error => {
      reject(error)
    }
    video.onloadedmetadata = () => {
      try {
        window.URL.revokeObjectURL(video.src)
        const duration = Math.round(video.duration)

        resolve(duration)
      } catch (error: any) {
        reject(error)
      }
    }
    video.src = videoSource(videoObj)
  })
}

/**
 * Get a video resolution
 *
 * @param videoObj Video file object or encoded buffer
 * @returns Video resolution
 */
export const getVideoResolution = (videoObj: string | File | ArrayBuffer) => {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onerror = error => {
      reject(error)
    }
    video.onloadedmetadata = () => {
      try {
        window.URL.revokeObjectURL(video.src)
        const resolution = video.videoHeight

        resolve(resolution)
      } catch (error: any) {
        reject(error)
      }
    }
    video.src = videoSource(videoObj)
  })
}

/**
 * Get video source *
 *
 * @param videoObj Video source/buffer/file
 */
const videoSource = (videoObj: string | File | ArrayBuffer) =>
  typeof videoObj === "string"
    ? videoObj
    : videoObj instanceof File
    ? URL.createObjectURL(videoObj)
    : URL.createObjectURL(new Blob([videoObj], { type: "video/mp4" }))

export const downloadImageData = async (imageUrl: string): Promise<Uint8Array | null> => {
  try {
    const resp = await http.get(imageUrl, {
      responseType: "arraybuffer",
      withCredentials: true,
    })
    return new Uint8Array(resp.data)
  } catch (error) {
    return null
  }
}

export const isAnimatedImage = (imageData: Uint8Array): boolean => {
  // make sure it's a gif (GIF8)
  if (
    imageData[0] !== 0x47 ||
    imageData[1] !== 0x49 ||
    imageData[2] !== 0x46 ||
    imageData[3] !== 0x38
  ) {
    return false
  }

  let frames = 0

  for (let i = 0; i < imageData.length - 9, frames < 2; ++i) {
    if (
      imageData[i] === 0x00 &&
      imageData[i + 1] === 0x21 &&
      imageData[i + 2] === 0xf9 &&
      imageData[i + 3] === 0x04 &&
      imageData[i + 8] === 0x00 &&
      (imageData[i + 9] === 0x2c || imageData[i + 9] === 0x21)
    ) {
      frames++
    }
  }

  return frames > 1
}
