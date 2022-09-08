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

import { useCallback, useEffect, useState } from "react"

import SwarmVideoIO from "@/classes/SwarmVideo"
import type { Video } from "@/definitions/swarm-video"
import useSelector from "@/state/useSelector"

type SwarmVideoOptions = {
  reference: string
  routeState?: Video
  fetchProfile?: boolean
  fetchFromCache?: boolean
}

export default function useSwarmVideo(opts: SwarmVideoOptions) {
  const { beeClient, indexClient } = useSelector(state => state.env)
  const [reference, setReference] = useState(opts.reference)
  const [video, setVideo] = useState<Video | null>(opts.routeState ?? null)
  const [isLoading, setIsloading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (reference !== opts.reference) {
      setReference(opts.reference)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.reference])

  // Returns
  const loadVideo = useCallback(async (): Promise<void> => {
    setIsloading(true)

    const videoReader = new SwarmVideoIO.Reader(reference, undefined, {
      beeClient,
      indexClient,
      fetchProfile: opts.fetchProfile,
      fetchFromCache: opts.fetchFromCache,
    })
    const video = await videoReader.download()

    if (video.indexReference && !video.isVideoOnIndex) {
      setNotFound(true)
    } else {
      setVideo(video)
    }

    setIsloading(false)
  }, [beeClient, indexClient, opts.fetchProfile, opts.fetchFromCache, reference])

  return {
    video,
    notFound,
    isLoading,
    loadVideo,
  }
}
