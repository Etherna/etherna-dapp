/**
 * Check if a mime type is an image
 * @param mime Mime type
 * @returns Whether the mime is an image
 */
export const isMimeImage = (mime: string) => {
  return /image\/[a-z0-9.-]*$/.test(mime || "")
}

/**
 * Check if a mime type is a video or an audio
 * @param mime Mime type
 * @returns Whether the mime is a video or an audio
 */
export const isMimeMedia = (mime: string) => {
  return /(audio\/[a-z0-9.-]*$)|(video\/[a-z0-9.-]*$)/.test(mime || "")
}

/**
 * Check if a mime type is a video or an audio
 * @param mime Mime type
 * @returns Whether the mime is a video or an audio
 */
export const isMimeAudio = (mime: string) => {
  return /(audio\/[a-z0-9.-]*$)/.test(mime || "")
}

/**
 * Check if a mime type is encodable with the FFMpeg coedc
 * @param mime File mime type
 * @returns Whether the mime is FFMpeg encodable
 */
export const isMimeFFMpegEncodable = (mime: string) => {
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
 * @param mime File mime type
 * @returns Whether the mime is web compatible
 */
export const isMimeWebCompatible = (mime: string) => {
  return !/(video\/avi$)/.test(mime)
}

/**
 * Check if a mime type is compatible with a list of mimes *
 * @param mime Mime type
 * @param compare Array of mime types to compare with
 * @returns Whether the mime is compatible
 */
export const isMimeCompatible = (mime: string, compare: string[]) => {
  for (const match of compare) {
    if (mime.match(match)) {
      return true
    }
  }
  return false
}
