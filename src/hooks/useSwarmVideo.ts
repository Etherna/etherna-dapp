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

type UseVideo = [
  /** Video object */
  video: Video | undefined,
  /** Download video info  */
  loadVideo: () => Promise<Video|undefined>
]

const useSwarmVideo = (opts: SwarmVideoOptions): UseVideo => {
  const [hash, setHash] = useState(opts.hash)
  const [videoHandler, setVideoHandler] = useState<SwarmVideo>()
  const { beeClient, indexClient } = useSelector(state => state.env)

  useEffect(() => {
    if (hash !== opts.hash) {
      setHash(opts.hash)
    }
  }, [hash, opts.hash])

  useEffect(() => {
    const { hash, fetchFromCache } = opts
    if (beeClient) {
      setVideoHandler(new SwarmVideo(hash, { beeClient, indexClient, fetchFromCache }))
    }
  }, [beeClient, indexClient, hash, opts])

  // Returns
  const video = opts.routeState ?? videoHandler?.video
  const load = async () => {
    if (!videoHandler) return

    return videoHandler.downloadVideo({ fetchProfile: opts.fetchProfile })
  }

  return [video, load]
}

export default useSwarmVideo
