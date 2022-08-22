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
  typeof videoObj === "string" ? videoObj
    : videoObj instanceof File
      ? URL.createObjectURL(videoObj)
      : URL.createObjectURL(new Blob([videoObj], { type: "video/mp4" }))
