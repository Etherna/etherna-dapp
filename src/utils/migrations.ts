import type { VideoPreviewRaw } from "@etherna/sdk-js"

export const requiresMigration = (version: VideoPreviewRaw["v"]) => {
  if (!version) return true
  switch (version) {
    case "1.0":
      return true // batchId
    case "1.1":
      return true // folder based storage
    case "1.2":
      return true // folder based storage
    case "2.0":
      return false
  }
}
