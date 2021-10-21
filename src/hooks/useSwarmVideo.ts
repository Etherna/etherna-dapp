/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
      setHash(opts.hash)
    }
    if (videoHandler.hash !== opts.hash) {
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
