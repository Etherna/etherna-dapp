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

import { useCallback, useEffect, useRef, useState } from "react"
import { EthernaResourcesHandler } from "@etherna/sdk-js/handlers"
import { isInvalidReference } from "@etherna/sdk-js/utils"

import useMounted from "./useMounted"
import { parseReaderStatus } from "./useVideoOffers"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"

import type { VideoOffersStatus } from "./useVideoOffers"
import type { Video } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

type UseVideosResourcesOptions = {
  autoFetch?: boolean
}

export default function useVideosResources(
  videos: Video[] | undefined,
  opts?: UseVideosResourcesOptions
) {
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const address = useUserStore(state => state.address)
  const [isFetchingOffers, setIsFetchingOffers] = useState(false)
  const [videosOffersStatus, setVideosOffersStatus] =
    useState<Record<Reference, VideoOffersStatus>>()
  const videosQueue = useRef<Reference[]>([])
  const mounted = useMounted()

  useEffect(() => {
    if (gatewayType === "bee") return

    if (videos && opts?.autoFetch) {
      fetchVideosStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, gatewayType])

  const fetchVideosStatus = useCallback(async () => {
    if (!videos) return
    if (!mounted.current) return

    setIsFetchingOffers(true)

    try {
      const videosToFetch = videos.filter(
        video =>
          !videosOffersStatus?.[video.reference] &&
          !videosQueue.current.includes(video.reference) &&
          !isInvalidReference(video.reference)
      )

      videosQueue.current = [...videosQueue.current, ...videosToFetch.map(video => video.reference)]

      const handler = new EthernaResourcesHandler(videosToFetch, { gatewayClient })
      await handler.fetchOffers()

      const statuses: Record<string, VideoOffersStatus> = {
        ...videosOffersStatus,
      }

      for (const video of videosToFetch) {
        statuses[video.reference] = parseReaderStatus(handler, video, address)
      }

      videosQueue.current = []
      mounted.current && setVideosOffersStatus(statuses)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetchingOffers(false)
    }
  }, [videos, videosOffersStatus, address, gatewayClient, mounted])

  const offerVideoResources = useCallback(
    async (video: Video) => {
      const handler = new EthernaResourcesHandler([video], { gatewayClient })
      await handler.offerResources()
      await handler.fetchOffers()
      const statuses = { ...videosOffersStatus }
      statuses[video.reference] = parseReaderStatus(handler, video, address)
      setVideosOffersStatus(statuses)
    },
    [videosOffersStatus, address, gatewayClient]
  )

  const unofferVideoResources = useCallback(
    async (video: Video) => {
      const handler = new EthernaResourcesHandler([video], { gatewayClient })
      await handler.unofferResources()
      await handler.fetchOffers()
      const statuses = { ...videosOffersStatus }
      statuses[video.reference] = parseReaderStatus(handler, video, address)
      setVideosOffersStatus(statuses)
    },
    [videosOffersStatus, address, gatewayClient]
  )

  const invalidate = useCallback(async () => {
    if (videos?.length) {
      await fetchVideosStatus()
    }
  }, [fetchVideosStatus, videos?.length])

  return {
    isFetchingOffers,
    videosOffersStatus,
    fetchVideosStatus,
    offerVideoResources,
    unofferVideoResources,
    invalidate,
  }
}
