/**
 * Get a video duration
 * @param videoObj Video file object or encoded buffer
 * @returns Duration in seconds
 */
export const getVideoDuration = (videoObj: string|File|ArrayBuffer) => {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onerror = error => {
      reject(error)
    }
    video.onloadedmetadata = () => {
      try {
        window.URL.revokeObjectURL(video.src)
        const duration = video.duration

        resolve(duration)
      } catch (error) {
        reject(error)
      }
    }
    video.src = videoSource(videoObj)
  })
}

/**
 * Get a video resolution
 * @param videoObj Video file object or encoded buffer
 * @returns Video resolution
 */
export const getVideoResolution = (videoObj: string|File|ArrayBuffer) => {
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
      } catch (error) {
        reject(error)
      }
    }
    video.src = videoSource(videoObj)
  })
}

/**
 * Get video source *
 * @param videoObj Video source/buffer/file
 */
const videoSource = (videoObj: string|File|ArrayBuffer) =>
  typeof videoObj === "string" ? videoObj
    : videoObj instanceof File
      ? URL.createObjectURL(videoObj)
      : URL.createObjectURL(new Blob([videoObj], { type: "video/mp4" }))
