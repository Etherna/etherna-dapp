/**
 * Check if a mime type is an image
 *
 * @param {string} mime Mime type
 * @returns {boolean} Whether the mime is an image
 */
export const isMimeImage = mime => {
    return /image\/[a-z0-9.-]*$/.test(mime || '')
}

/**
 * Check if a mime type is a video or an audio
 *
 * @param {string} mime Mime type
 * @returns {boolean} Whether the mime is a video or an audio
 */
export const isMimeMedia = mime => {
    return /(audio\/[a-z0-9.-]*$)|(video\/[a-z0-9.-]*$)/.test(mime || '')
}

/**
 * Check if a mime type is encodable with the FFMpeg coedc
 * @param {string} mime File mime type
 */
export const isMimeFFMpegEncodable = mime => {
    return /(video\/avi)$/.test(mime)
}
