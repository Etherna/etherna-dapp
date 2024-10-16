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
import { VideoDeserializer } from "@etherna/sdk-js/serializers"
import { dateToTimestamp } from "@etherna/sdk-js/utils"

import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import { nullablePromise } from "@/utils/promise"

import type { AnyListVideo, VideoWithIndexes } from "@/types/video"
import type { IndexVideo, Reference } from "@etherna/sdk-js/clients"

type SwarmVideoOptions = {
  reference: string
  routeState?: AnyListVideo | null
  fetchIndexStatus?: boolean
}

export default function useSwarmVideo(opts: SwarmVideoOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const [reference, setReference] = useState(opts.reference)
  const [video, setVideo] = useState<VideoWithIndexes | null>(
    opts.routeState ? { ...opts.routeState, indexesStatus: {} } : null
  )
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

      const mode = video?.preview ? "details" : "full"
      let [newVideo, indexVideo] = await Promise.all([
        videoReader.download({ mode, previewData: video?.preview }) as Promise<VideoWithIndexes>,
        isSwarmReference
          ? nullablePromise(indexClient.videos.fetchVideoFromHash(reference))
          : Promise.resolve(null),
      ])

      if (!newVideo && !indexVideo?.lastValidManifest?.sources.length) {
        throw new Error("Video not found")
      }

      if (!newVideo && indexVideo?.lastValidManifest?.sources.length) {
        const deserializer = new VideoDeserializer(beeClient.url)
        const parsedIndexVideo = JSON.stringify(SwarmVideo.Reader.indexVideoToRaw(indexVideo))
        const preview = deserializer.deserializePreview(parsedIndexVideo, {
          reference: indexVideo.lastValidManifest.hash,
        })
        const details = deserializer.deserializeDetails(parsedIndexVideo, {
          reference: indexVideo.lastValidManifest.hash,
        })
        newVideo = {
          reference: indexVideo.lastValidManifest.hash as Reference,
          preview,
          details,
          indexesStatus: {},
        }
      }

      if (!newVideo) {
        throw new Error("Video not found")
      }

      newVideo.indexesStatus = {}

      indexVideo =
        indexVideo ??
        ("lastValidManifest" in (videoReader.rawResponse ?? {})
          ? (videoReader.rawResponse as IndexVideo)
          : null)

      if (indexVideo) {
        newVideo.indexesStatus[indexUrl] = {
          indexReference: indexVideo.id,
          totDownvotes: indexVideo.totDownvotes,
          totUpvotes: indexVideo.totUpvotes,
          userVote: indexVideo.currentVoteValue,
        }
      }

      setVideo(newVideo)
    } catch (error) {
      console.error(error)
      setNotFound(true)
    } finally {
      setIsloading(false)
    }
  }, [beeClient, indexClient, indexUrl, reference, video?.preview])

  return {
    video,
    notFound,
    isLoading,
    loadVideo,
  }
}
