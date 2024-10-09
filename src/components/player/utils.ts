import {
  AUDIO_MANIFEST_REGEX,
  MASTER_MANIFEST_REGEX,
  VIDEO_MANIFEST_REGEX,
} from "@etherna/sdk-js/utils"

import type { VideoSource } from "@etherna/sdk-js"

export function getSourceResolution(source: VideoSource) {
  if (source.type === "mp4") {
    return parseInt(source.quality)
  } else {
    if (AUDIO_MANIFEST_REGEX.test(source.path)) {
      return 0
    }
    if (MASTER_MANIFEST_REGEX.test(source.path)) {
      return Infinity
    }
    const matches = VIDEO_MANIFEST_REGEX.exec(source.path)
    return matches?.groups?.q ? parseInt(matches.groups.q) : 0
  }
}

export function getSourceLabel(source: VideoSource) {
  if (source.type === "mp4") {
    return source.quality
  } else {
    if (AUDIO_MANIFEST_REGEX.test(source.url)) {
      return "Audio only"
    }
    if (MASTER_MANIFEST_REGEX.test(source.url)) {
      return "Auto"
    }
    const matches = VIDEO_MANIFEST_REGEX.exec(source.url)
    const res = matches?.groups?.q ? parseInt(matches.groups.q) : 0
    return `${res}p`
  }
}
