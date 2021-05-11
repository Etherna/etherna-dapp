import SwarmVideo from "@classes/SwarmVideo"
import { Video } from "@classes/SwarmVideo/types"
import { store } from "@state/store"

const match = /\/watch/

const fetch = async () => {
  const { beeClient, indexClient } = store.getState().env

  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams && searchParams.has("v")) {
    const hash = searchParams.get("v")!

    try {
      const swarmVideo = new SwarmVideo(hash, {
        beeClient,
        indexClient
      })
      const video = await swarmVideo.downloadVideo({
        fetchProfile: true,
        forced: true
      })

      // set prefetch data
      window.prefetchData = {}
      window.prefetchData.video = video
    } catch (error) {
      console.error(error)
    }
  }
}

const videoPrefetcher = {
  match,
  fetch,
}

export type VideoPrefetch = {
  video?: Video
}

export default videoPrefetcher
