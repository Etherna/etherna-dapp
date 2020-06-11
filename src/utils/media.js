/**
 * Get a video duration
 * @param {File|ArrayBuffer} videoObj Video file object or encoded buffer
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
        video.src = videoObj instanceof File
            ? URL.createObjectURL(videoObj)
            : URL.createObjectURL(new Blob([videoObj], { type: 'video/mp4' }))
    })
}
