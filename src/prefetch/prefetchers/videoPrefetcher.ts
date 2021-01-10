import { fetchFullVideoInfo, VideoMetadata } from "@utils/video"
import { WindowPrefetchData } from "typings/window"

const match = /\/watch/

const fetch = async () => {
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams && searchParams.has("v")) {
    const hash = searchParams.get("v")!

    try {
      const video = await fetchFullVideoInfo(hash, true)
      // set prefetch data
      const windowPrefetch = window as WindowPrefetchData
      windowPrefetch.prefetchData = video
    } catch (error) {
      console.error(error)
    }
  }
}

const videoPrefetcher = {
  match,
  fetch,
}

export type VideoPrefetch = VideoMetadata

export default videoPrefetcher
