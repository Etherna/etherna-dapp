/**
 * Check if a mime type is an image
 *
 * @param {string} mime Mime type
 * @returns {boolean} Whether the mime is an image
 */
export const isMimeImage = mime => {
  return /image\/[a-z0-9.-]*$/.test(mime || "")
}

/**
 * Check if a mime type is a video or an audio
 *
 * @param {string} mime Mime type
 * @returns {boolean} Whether the mime is a video or an audio
 */
export const isMimeMedia = mime => {
  return /(audio\/[a-z0-9.-]*$)|(video\/[a-z0-9.-]*$)/.test(mime || "")
}

/**
 * Check if a mime type is encodable with the FFMpeg coedc
 * @param {string} mime File mime type
 * @returns {boolean} Whether the mime is FFMpeg encodable
 */
export const isMimeFFMpegEncodable = mime => {
  const mimeEncodables = [/video\/avi$/, /video\/webm$/, /video\/mp4$/, /audio\/mpeg$/]
  for (const pattern of mimeEncodables) {
    if ((mime || "").match(pattern)) {
      return true
    }
  }
  return false
}

/**
 * Check if a mime type is compatible with html <video> or <audio> tags
 * @param {string} mime File mime type
 * @returns {boolean} Whether the mime is web compatible
 */
export const isMimeWebCompatible = mime => {
  return !/(video\/avi$)/.test(mime)
}

/**
 * Check if a mime type is compatible with a list of mimes
 *
 * @param {string} mime Mime type
 * @param {string[]} compare Array of mime types to compare with
 * @returns {boolean} Whether the mime is compatible
 */
export const isMimeCompatible = (mime, compare) => {
  for (const match of compare) {
    if (mime.match(match)) {
      return true
    }
  }
  return false
}
