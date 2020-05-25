/**
 * Get the video duration of a file
 * @param {File} file Video file object
 */
export const getVideoDuration = file => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onloadedmetadata = () => {
            try {
                window.URL.revokeObjectURL(video.src)
                const duration = parseInt(video.duration)

                resolve(duration)
            } catch (error) {
                reject(error)
            }
        }
        video.src = URL.createObjectURL(file)
    })
}
