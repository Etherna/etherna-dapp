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
import { EthernaResourcesHandler } from "@etherna/sdk-js/handlers"
import { VideoDeserializer } from "@etherna/sdk-js/serializers"

import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { Video, VideoRaw, VideoSource } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

export type VideoOffersStatus = {
  offersStatus: "full" | "partial" | "sources" | "none"
  userOffersStatus: "full" | "partial" | "sources" | "none"
  userOfferedResourses: string[]
  userUnOfferedResourses: string[]
  globalOffers: { reference: string; offeredBy: string[] }[]
}

interface UseVideoOffersOpts {
  routeState?: VideoOffersStatus
  disable?: boolean
  reference?: string
}

export default function useVideoOffers(
  video: Video | VideoRaw | null | undefined,
  opts?: UseVideoOffersOpts
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const address = useUserStore(state => state.address)
  const [videoOffersStatus, setVideoOffersStatus] = useState<VideoOffersStatus>()

  useEffect(() => {
    if (opts?.disable) return
    if (video && !("reference" in video) && !opts?.reference) return

    if (video && !videoOffersStatus) {
      opts?.routeState && setVideoOffersStatus(opts.routeState)
      // route state doesn't have the user offers so
      // we still need to fetch the video status
      fetchVideoStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, opts])

  const getParsedVideo = useCallback((): Video => {
    if (!video) {
      throw new Error("No video provided")
    }

    const isRawVideo = !("reference" in video)

    if (isRawVideo && !opts?.reference) {
      throw new Error("Missing reference. Reference is required when using a raw video.")
    }

    if (isRawVideo) {
      const videoDeserializer = new VideoDeserializer(beeClient.url)
      const preview = videoDeserializer.deserializePreview(JSON.stringify(video), {
        reference: opts!.reference!,
      })
      const details = videoDeserializer.deserializeDetails(JSON.stringify(video), {
        reference: opts!.reference!,
      })

      return {
        reference: opts!.reference! as Reference,
        preview,
        details,
      }
    }

    return video
  }, [beeClient.url, opts, video])

  const fetchVideoStatus = useCallback(async () => {
    if (!video) return

    try {
      const parsedVideo = getParsedVideo()
      const resourcesHandler = new EthernaResourcesHandler([parsedVideo], { gatewayClient })
      await resourcesHandler.fetchOffers()

      setVideoOffersStatus(parseReaderStatus(resourcesHandler, parsedVideo, address))
    } catch (error) {
      console.error(error)
    }
  }, [video, getParsedVideo, gatewayClient, address])

  const offerResources = useCallback(async () => {
    if (!video) throw new Error("Video not loaded")

    const parsedVideo = getParsedVideo()
    const resourcesHandler = new EthernaResourcesHandler([parsedVideo], { gatewayClient })
    await resourcesHandler.offerResources()
    await resourcesHandler.fetchOffers()
    setVideoOffersStatus(parseReaderStatus(resourcesHandler, parsedVideo, address))
  }, [video, getParsedVideo, gatewayClient, address])

  const unofferResources = useCallback(async () => {
    if (!video) throw new Error("Video not loaded")

    const parsedVideo = getParsedVideo()
    const resourcesHandler = new EthernaResourcesHandler([parsedVideo], { gatewayClient })
    await resourcesHandler.unofferResources()
    await resourcesHandler.fetchOffers()
    setVideoOffersStatus(parseReaderStatus(resourcesHandler, parsedVideo, address))
  }, [video, getParsedVideo, gatewayClient, address])

  return {
    videoOffersStatus,
    offerResources,
    unofferResources,
  }
}

export const parseReaderStatus = (
  handler: EthernaResourcesHandler,
  video: Video,
  userAddress: string | undefined
): VideoOffersStatus => {
  const handlerVideoResources = handler.getVideoReferencesStatus(video)
  return {
    offersStatus: getStatus(handler, video),
    userOffersStatus: getStatus(handler, video, userAddress ?? "0x0"),
    globalOffers: handlerVideoResources,
    userOfferedResourses: userAddress
      ? (handlerVideoResources.map(status => status.reference) ?? []).filter(reference =>
          handler.getReferenceStatus(reference)?.offeredBy.includes(userAddress)
        )
      : [],
    userUnOfferedResourses: userAddress
      ? (handlerVideoResources.map(status => status.reference) ?? []).filter(
          reference => !handler.getReferenceStatus(reference)?.offeredBy.includes(userAddress)
        )
      : [],
  }
}

function getStatus(handler: EthernaResourcesHandler, video: Video, byAddress?: string) {
  const handlerVideoResources = handler.getVideoReferencesStatus(video)
  const resourcesStatus = handlerVideoResources.filter(
    r => !byAddress || r.offeredBy.includes(byAddress)
  )
  const resourcesCount = resourcesStatus.length
  const offeredResourcesCount = resourcesStatus.filter(status => status.isOffered).length
  const details = "details" in video ? video.details : null
  const videoSourcesReferences: string[] = details?.sources.length
    ? (
        details.sources.filter(
          source => source.type === "mp4" && source.reference
        ) as (VideoSource & { type: "mp4" })[]
      ).map(source => source.reference!)
    : []
  const allSourcesOffered = videoSourcesReferences
    .map(reference => handler.getReferenceStatus(reference))
    .every(status => status?.isOffered && (!byAddress || status.offeredBy.includes(byAddress)))
  const fullyOffered = offeredResourcesCount === resourcesCount

  return offeredResourcesCount > 0
    ? fullyOffered
      ? "full"
      : allSourcesOffered
        ? "sources"
        : "partial"
    : "none"
}
