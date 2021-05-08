import { useEffect, useState } from "react"

import { Video } from "@classes/SwarmVideo/types"
import SwarmVideo from "@classes/SwarmVideo"
import useSelector from "@state/useSelector"

type SwarmVideoOptions = {
  hash: string
  routeState?: Video
  fetchProfile?: boolean
  fetchFromCache?: boolean
}

type UseVideo = {
  /** Video object */
  video: Video | undefined,
  /** Download video info  */
  loadVideo: () => Promise<Video | undefined>
}

const useSwarmVideo = (opts: SwarmVideoOptions): UseVideo => {
  const { beeClient, indexClient } = useSelector(state => state.env)
  const [hash, setHash] = useState(opts.hash)
  const [videoHandler, setVideoHandler] = useState<SwarmVideo>(
    new SwarmVideo(hash, { beeClient, indexClient, fetchFromCache: opts.fetchFromCache })
  )
  const [video, setVideo] = useState<Video | undefined>(opts.routeState)

  useEffect(() => {
    if (hash !== opts.hash) {
      console.log("different hash", hash, opts.hash)

      setHash(opts.hash)
    }
    if (videoHandler.hash !== opts.hash) {
      console.log("different handler hash", hash, opts.hash)
      setVideoHandler(new SwarmVideo(hash, { beeClient, indexClient, fetchFromCache: opts.fetchFromCache }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.hash])

  // Returns
  const loadVideo = async () => {
    if (!videoHandler) return

    const video = await videoHandler.downloadVideo({ fetchProfile: opts.fetchProfile })

    setVideo(video)

    return video
  }

  return {
    video,
    loadVideo
  }
}

export default useSwarmVideo
