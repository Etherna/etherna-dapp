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

import SwarmResourcesIO from "@/classes/SwarmResources"
import useSelector from "@/state/useSelector"
import type SwarmResourcesReader from "@/classes/SwarmResources/SwarmResourcesReader"
import type { SwarmVideoRaw, Video, VideoOffersStatus } from "@/definitions/swarm-video"
import SwarmVideoIO from "@/classes/SwarmVideo"

type UseVideoOffersOpts = {
  routeState?: VideoOffersStatus
  disable?: boolean
  reference?: string
}

export default function useVideoOffers(video: Video | SwarmVideoRaw | null | undefined, opts?: UseVideoOffersOpts) {
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

  const getParsedVideo = useCallback(() => {
    if (!video) {
      throw new Error("No video provided")
    }

    const isFullVideo = "reference" in video

    if (!isFullVideo && !opts?.reference) {
      throw new Error("Missing reference. Reference is required when using a raw video.")
    }
    const parsedVideo = isFullVideo
      ? video
      : new SwarmVideoIO.Reader(opts!.reference!, address, {
        beeClient,
        videoData: video,
      }).video

    return parsedVideo
  }, [address, beeClient, opts, video])

  const fetchVideoStatus = useCallback(async () => {
    if (!video) return

    try {
      const parsedVideos = getParsedVideo()
      const reader = new SwarmResourcesIO.Reader(parsedVideos, { gatewayClient })
      await reader.download()

      setVideoOffersStatus(parseReaderStatus(reader, address))
    } catch (error) {
      console.error(error)
    }
  }, [video, getParsedVideo, gatewayClient, address])

  const offerResources = useCallback(async () => {
    if (!video) throw new Error("Video not loaded")

    const parsedVideos = getParsedVideo()
    const writer = new SwarmResourcesIO.Writer(parsedVideos, { gatewayClient })
    await writer.offerResources()
    const reader = new SwarmResourcesIO.Reader(parsedVideos, { gatewayClient })
    await reader.download()
    setVideoOffersStatus(parseReaderStatus(reader, address))
  }, [video, getParsedVideo, gatewayClient, address])

  const unofferResources = useCallback(async () => {
    if (!video) throw new Error("Video not loaded")

    const parsedVideos = getParsedVideo()
    const writer = new SwarmResourcesIO.Writer(parsedVideos, { gatewayClient })
    await writer.unofferResources()
    const reader = new SwarmResourcesIO.Reader(parsedVideos, { gatewayClient })
    await reader.download()
    setVideoOffersStatus(parseReaderStatus(reader, address))
  }, [video, getParsedVideo, gatewayClient, address])

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
  const fullyOffered = offeredResourcesCount === resourcesCount

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
