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
import type { Video, VideoRaw } from "@etherna/api-js"
import { EthernaResourcesHandler } from "@etherna/api-js/handlers"
import { VideoDeserializer } from "@etherna/api-js/serializers"

import useSelector from "@/state/useSelector"

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
  const beeClient = useSelector(state => state.env.beeClient)
  const gatewayClient = useSelector(state => state.env.gatewayClient)
  const address = useSelector(state => state.user.address)
  const [videoOffersStatus, setVideoOffersStatus] = useState<VideoOffersStatus>()

  useEffect(() => {
    if (opts?.disable) return
    if (video && !("reference" in video) && !opts?.reference) return

    if (video && !videoOffersStatus && !opts?.routeState) {
      fetchVideoStatus()
    }
    if (!videoOffersStatus && opts?.routeState) {
      setVideoOffersStatus(opts.routeState)
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
      return new VideoDeserializer(beeClient.url).deserialize(JSON.stringify(video), {
        reference: opts!.reference!,
      })
    }

    return video
  }, [beeClient.url, opts, video])

  const fetchVideoStatus = useCallback(async () => {
    if (!video) return

    try {
      const parsedVideo = getParsedVideo()
      const resourcesHandler = new EthernaResourcesHandler(parsedVideo, { gatewayClient })
      await resourcesHandler.fetchOffers()

      setVideoOffersStatus(parseReaderStatus(resourcesHandler, address))
    } catch (error) {
      console.error(error)
    }
  }, [video, getParsedVideo, gatewayClient, address])

  const offerResources = useCallback(async () => {
    if (!video) throw new Error("Video not loaded")

    const parsedVideo = getParsedVideo()
    const resourcesHandler = new EthernaResourcesHandler(parsedVideo, { gatewayClient })
    await resourcesHandler.offerResources()
    await resourcesHandler.fetchOffers()
    setVideoOffersStatus(parseReaderStatus(resourcesHandler, address))
  }, [video, getParsedVideo, gatewayClient, address])

  const unofferResources = useCallback(async () => {
    if (!video) throw new Error("Video not loaded")

    const parsedVideo = getParsedVideo()
    const resourcesHandler = new EthernaResourcesHandler(parsedVideo, { gatewayClient })
    await resourcesHandler.unofferResources()
    await resourcesHandler.fetchOffers()
    setVideoOffersStatus(parseReaderStatus(resourcesHandler, address))
  }, [video, getParsedVideo, gatewayClient, address])

  return {
    videoOffersStatus,
    offerResources,
    unofferResources,
  }
}

export const parseReaderStatus = (
  handler: EthernaResourcesHandler,
  userAddress: string | undefined
): VideoOffersStatus => {
  return {
    offersStatus: getStatus(handler),
    userOffersStatus: getStatus(handler, userAddress),
    globalOffers: handler.resourcesStatus ?? [],
    userOfferedResourses: userAddress
      ? (handler.resourcesStatus?.map(status => status.reference) ?? []).filter(reference =>
          handler.getReferenceStatus(reference)?.offeredBy.includes(userAddress)
        )
      : [],
    userUnOfferedResourses: userAddress
      ? (handler.resourcesStatus?.map(status => status.reference) ?? []).filter(
          reference => !handler.getReferenceStatus(reference)?.offeredBy.includes(userAddress)
        )
      : [],
  }
}

function getStatus(handler: EthernaResourcesHandler, byAddress?: string) {
  const resourcesStatus = (handler.resourcesStatus ?? []).filter(
    r => !byAddress || r.offeredBy.includes(byAddress)
  )
  const resourcesCount = resourcesStatus.length
  const offeredResourcesCount = resourcesStatus.filter(status => status.isOffered).length
  const allSourcesOffered =
    handler.video.sources.length > 0 &&
    handler.video.sources
      .map(source => handler.getReferenceStatus(source.reference))
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
