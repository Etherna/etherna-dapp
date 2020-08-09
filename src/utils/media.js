/**
 * Get a video duration
 * @param {string|File|ArrayBuffer} videoObj Video file object or encoded buffer
 * @returns {number} Duration in seconds
 */
export const getVideoDuration = videoObj => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onerror = error => {
            reject(error)
        }
        video.onloadedmetadata = () => {
            try {
                window.URL.revokeObjectURL(video.src)
                const duration = parseInt(video.duration)

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
 * @param {string|File|ArrayBuffer} videoObj Video file object or encoded buffer
 * @returns {number} Video resolution
 */
export const getVideoResolution = videoObj => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onerror = error => {
            reject(error)
        }
        video.onloadedmetadata = () => {
            try {
                window.URL.revokeObjectURL(video.src)
                const resolution = parseInt(video.videoHeight)

                resolve(resolution)
            } catch (error) {
                reject(error)
            }
        }
        video.src = videoSource(videoObj)
    })
}

/**
 * Get video source
 *
 * @param {string|File|ArrayBuffer} videoObj Video source/buffer/file
 * @returns {string}
 */
const videoSource = videoObj =>
    typeof videoObj === "string" ? videoObj
        : videoObj instanceof File
            ? URL.createObjectURL(videoObj)
            : URL.createObjectURL(new Blob([videoObj], { type: 'video/mp4' }))