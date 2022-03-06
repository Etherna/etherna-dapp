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

import SwarmResourcesIO from "@classes/SwarmResources"
import useSelector from "@state/useSelector"
import type SwarmResourcesReader from "@classes/SwarmResources/SwarmResourcesReader"
import type { Video, VideoOffersStatus } from "@definitions/swarm-video"

type UseVideoOffersOpts = {
  routeState?: VideoOffersStatus
  disable?: boolean
}

export default function useVideoOffers(video: Video | null | undefined, opts?: UseVideoOffersOpts) {
  const { gatewayClient } = useSelector(state => state.env)
  const { address } = useSelector(state => state.user)
  const [videoOffersStatus, setVideoOffersStatus] = useState<VideoOffersStatus>()

  useEffect(() => {
    if (opts?.disable) return

    if (video && !videoOffersStatus && !opts?.routeState) {
      fetchVideoStatus()
    }
    if (!videoOffersStatus && opts?.routeState) {
      setVideoOffersStatus(opts.routeState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, opts])

  const fetchVideoStatus = async () => {
    if (!video) return

    try {
      const reader = new SwarmResourcesIO.Reader(video, { gatewayClient })
      await reader.download()

      setVideoOffersStatus(parseReaderStatus(reader, address))
    } catch (error) {
      console.error(error)
    }
  }

  const offerResources = async () => {
    if (!video) throw new Error("Video not loaded")

    const writer = new SwarmResourcesIO.Writer(video, { gatewayClient })
    await writer.offerResources()
    const reader = new SwarmResourcesIO.Reader(video, { gatewayClient })
    await reader.download()
    setVideoOffersStatus(parseReaderStatus(reader, address))
  }

  const unofferResources = async () => {
    if (!video) throw new Error("Video not loaded")

    const writer = new SwarmResourcesIO.Writer(video, { gatewayClient })
    await writer.unofferResources()
    const reader = new SwarmResourcesIO.Reader(video, { gatewayClient })
    await reader.download()
    setVideoOffersStatus(parseReaderStatus(reader, address))
  }

  return {
    videoOffersStatus,
    offerResources,
    unofferResources,
  }
}

export const parseReaderStatus = (reader: SwarmResourcesReader, userAddress: string | undefined): VideoOffersStatus => {
  const resourcesCount = reader.resourcesStatus?.length ?? 0
  const offeredResourcesCount = (reader.resourcesStatus ?? [])
    .filter(status => status.isOffered).length
  const allSourcesOffered = reader.video.sources.length > 0 && reader.video.sources
    .map(source => reader.getReferenceStatus(source.reference))
    .every(status => status?.isOffered)
  const manifestOffers = reader.resourcesStatus?.find(offers => offers.reference === reader.video.reference)
  const fullyOffered = offeredResourcesCount === resourcesCount ||
    (offeredResourcesCount === resourcesCount - 1 && !manifestOffers?.isOffered)

  return {
    offersStatus: offeredResourcesCount > 0
      ? fullyOffered
        ? "full"
        : allSourcesOffered
          ? "sources"
          : "partial"
      : "none",
    globalOffers: reader.resourcesStatus ?? [],
    userOfferedResourses: userAddress
      ? (reader.resourcesStatus?.map(status => status.reference) ?? [])
        .filter(reference => reader.getReferenceStatus(reference)?.offeredBy.includes(userAddress))
      : [],
    userUnOfferedResourses: userAddress
      ? (reader.resourcesStatus?.map(status => status.reference) ?? [])
        .filter(reference => !reader.getReferenceStatus(reference)?.offeredBy.includes(userAddress))
      : [],
  }
}
