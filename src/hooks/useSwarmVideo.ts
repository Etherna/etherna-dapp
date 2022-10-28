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
import { VideoDeserializer } from "@etherna/api-js/serializers"

import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import { nullablePromise } from "@/utils/promise"

import type { VideoWithIndexes } from "@/types/video"
import type { IndexVideo } from "@etherna/api-js/clients"

type SwarmVideoOptions = {
  reference: string
  routeState?: VideoWithIndexes | null
  fetchIndexStatus?: boolean
}

export default function useSwarmVideo(opts: SwarmVideoOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)
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

      if (!video && !indexVideo?.lastValidManifest?.sources.length) {
        throw new Error("Video not found")
      }

      if (!video && indexVideo?.lastValidManifest?.sources.length) {
        const videoParsed = new VideoDeserializer(beeClient.url).deserialize(
          JSON.stringify({
            ownerAddress: indexVideo.ownerAddress,
            title: indexVideo.lastValidManifest.title,
            description: indexVideo.lastValidManifest.description,
            thumbnail: indexVideo.lastValidManifest.thumbnail,
            batchId: indexVideo.lastValidManifest.batchId ?? null,
            duration: indexVideo.lastValidManifest.duration,
            originalQuality: indexVideo.lastValidManifest.originalQuality,
            sources: indexVideo.lastValidManifest.sources,
            createdAt: new Date(indexVideo.creationDateTime).getTime(),
            updatedAt: indexVideo.lastValidManifest.updatedAt ?? null,
          }),
          {
            reference: indexVideo.lastValidManifest.hash,
          }
        )
        video = {
          ...videoParsed,
          indexesStatus: {},
        }
      }

      if (!video) {
        throw new Error("Video not found")
      }

      video.indexesStatus = {}

      indexVideo =
        indexVideo ??
        ("lastValidManifest" in (videoReader.rawResponse ?? {})
          ? (videoReader.rawResponse as IndexVideo)
          : null)

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
