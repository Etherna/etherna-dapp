import type { VideoSource } from "@etherna/sdk-js"

export const AUDIO_REGEX = /audio(\/playlist)?\.(mpd|m3u8)$/
export const VIDEO_REGEX = /(?<q>([0-9]{3,}p)|([0-9]{3,}p))(\/playlist)?\.(mpd|m3u8)$/
export const MANIFEST_REGEX = /(manifest|master)\.(mpd|m3u8)$/

export function getSourceResolution(source: VideoSource) {
  if (source.type === "mp4") {
    return parseInt(source.quality)
  } else {
    if (AUDIO_REGEX.test(source.path)) {
      return 0
    }
    if (MANIFEST_REGEX.test(source.path)) {
      return Infinity
    }
    const matches = VIDEO_REGEX.exec(source.path)
    return matches?.groups?.q ? parseInt(matches.groups.q) : 0
  }
}

export function getSourceLabel(source: VideoSource) {
  if (source.type === "mp4") {
    return source.quality
  } else {
    if (AUDIO_REGEX.test(source.url)) {
      return "Audio only"
    }
    if (MANIFEST_REGEX.test(source.url)) {
      return "Auto"
    }
    const matches = VIDEO_REGEX.exec(source.url)
    const res = matches?.groups?.q ? parseInt(matches.groups.q) : 0
    return `${res}p`
  }
}
