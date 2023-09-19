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

import { useCallback, useEffect, useMemo, useState } from "react"
import { EthernaPinningHandler } from "@etherna/sdk-js/handlers"

import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"

import type { Video, VideoSource } from "@etherna/sdk-js"

export type VideoPinningStatus = {
  pinningStatus: "full" | "partial" | "sources" | "none"
  userPinningStatus: "full" | "partial" | "sources" | "none"
  userPinnedResourses: string[]
  userUnPinnedResourses: string[]
  globalPinning: { reference: string; pinnedBy: string[]; inProgress: boolean }[]
}

interface UseVideoPinningOpts {
  disable?: boolean
}

export default function useVideoPinning(
  video: Video | null | undefined,
  opts?: UseVideoPinningOpts
) {
  const clientType = useExtensionsStore(state => state.currentGatewayType)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const address = useUserStore(state => state.address)
  const [videoPinningStatus, setVideoPinningStatus] = useState<VideoPinningStatus>()

  const pinningHandler = useMemo(() => {
    if (!video) return null
    const pinningHandler = new EthernaPinningHandler([video], {
      client: clientType === "bee" ? beeClient : gatewayClient,
    })
    return pinningHandler
  }, [video, clientType, beeClient, gatewayClient])

  useEffect(() => {
    if (opts?.disable) return

    if (video && !videoPinningStatus) {
      fetchVideoStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, opts])

  const fetchVideoStatus = useCallback(async () => {
    if (!video || !pinningHandler) return

    try {
      await pinningHandler.fetchPins({ withByWhom: true })

      setVideoPinningStatus(parseReaderStatus(pinningHandler, video, address))
    } catch (error) {
      console.error(error)
    }
  }, [video, pinningHandler, address])

  const pinResources = useCallback(async () => {
    if (!video || !pinningHandler) throw new Error("Video not loaded")

    await pinningHandler.pinResources()
    await pinningHandler.fetchPins({ withByWhom: true })
    setVideoPinningStatus(parseReaderStatus(pinningHandler, video, address))
  }, [video, pinningHandler, address])

  const unpinResources = useCallback(async () => {
    if (!video || !pinningHandler) throw new Error("Video not loaded")

    await pinningHandler.unpinResources()
    await pinningHandler.fetchPins({ withByWhom: true })
    setVideoPinningStatus(parseReaderStatus(pinningHandler, video, address))
  }, [video, pinningHandler, address])

  return {
    videoPinningStatus,
    pinResources,
    unpinResources,
  }
}

function parseReaderStatus(
  handler: EthernaPinningHandler,
  video: Video,
  userAddress: string | undefined
): VideoPinningStatus {
  const handlerVideoResources = handler.getVideoReferencesStatus(video)
  return {
    pinningStatus: getStatus(handler, video),
    userPinningStatus: getStatus(handler, video, userAddress ?? "0x0"),
    globalPinning: handlerVideoResources.map(status => ({
      reference: status.reference,
      inProgress: status.isPinningInProgress === true,
      pinnedBy: status.pinnedBy ?? [],
    })),
    userPinnedResourses: userAddress
      ? (handlerVideoResources.map(status => status.reference) ?? []).filter(
          reference => handler.getReferenceStatus(reference)?.pinnedBy?.includes(userAddress)
        )
      : [],
    userUnPinnedResourses: userAddress
      ? (handlerVideoResources.map(status => status.reference) ?? []).filter(
          reference => !handler.getReferenceStatus(reference)?.pinnedBy?.includes(userAddress)
        )
      : [],
  }
}

function getStatus(handler: EthernaPinningHandler, video: Video, byAddress?: string) {
  const handlerVideoResources = handler.getVideoReferencesStatus(video)
  const resourcesStatus = handlerVideoResources.filter(
    r => !byAddress || r.pinnedBy?.includes(byAddress)
  )
  const resourcesCount = resourcesStatus.length
  const pinnedResourcesCount = resourcesStatus.filter(status => status.isPinned).length
  const videoSourcesStatus = video.details?.sources.length
    ? (
        video.details.sources.filter(
          source => source.type === "mp4" && source.reference
        ) as (VideoSource & { type: "mp4" })[]
      ).map(source => handler.getReferenceStatus(source.reference!))
    : []
  const allSourcesPinned = videoSourcesStatus.every(
    status => status?.isPinned && (!byAddress || status.pinnedBy?.includes(byAddress))
  )
  const fullyPinned = pinnedResourcesCount === resourcesCount

  return pinnedResourcesCount > 0
    ? fullyPinned
      ? "full"
      : allSourcesPinned
      ? "sources"
      : "partial"
    : "none"
}
