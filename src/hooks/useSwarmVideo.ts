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
import type { Video } from "@etherna/api-js"
import type { IndexVideo } from "@etherna/api-js/clients"

import SwarmVideo from "@/classes/SwarmVideo"
import useSelector from "@/state/useSelector"
import type { VideoWithIndexes } from "@/types/video"
import { nullablePromise } from "@/utils/promise"

type SwarmVideoOptions = {
  reference: string
  routeState?: VideoWithIndexes | null
  fetchIndexStatus?: boolean
}

export default function useSwarmVideo(opts: SwarmVideoOptions) {
  const beeClient = useSelector(state => state.env.beeClient)
  const indexClient = useSelector(state => state.env.indexClient)
  const indexUrl = useSelector(state => state.env.indexUrl)
  const [reference, setReference] = useState(opts.reference)
  const [video, setVideo] = useState<VideoWithIndexes | null>(opts.routeState ?? null)
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

    try {
      const isSwarmReference = beeClient.isValidHash(reference)
      const videoReader = new SwarmVideo.Reader(reference, {
        beeClient,
        indexClient,
      })

      let [video, indexVideo] = await Promise.all([
        videoReader.download() as Promise<VideoWithIndexes>,
        isSwarmReference
          ? nullablePromise(indexClient.videos.fetchVideoFromHash(reference))
          : Promise.resolve(null),
      ])
      video.indexesStatus = {}

      if (!video) {
        throw new Error("Video not found")
      }

      indexVideo =
        indexVideo ?? "lastValidManifest" in (videoReader.rawResponse ?? {})
          ? (videoReader.rawResponse as IndexVideo)
          : null

      if (indexVideo) {
        video.indexesStatus[indexUrl] = {
          indexReference: indexVideo.id,
          totDownvotes: indexVideo.totDownvotes,
          totUpvotes: indexVideo.totUpvotes,
        }
      }

      setVideo(video)
    } catch (error) {
      console.error(error)
      setNotFound(true)
    } finally {
      setIsloading(false)
    }
  }, [beeClient, indexClient, indexUrl, reference])

  return {
    video,
    notFound,
    isLoading,
    loadVideo,
  }
}
