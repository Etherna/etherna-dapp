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

import useMounted from "./useMounted"
import { parseReaderStatus } from "./useVideoOffers"
import SwarmResourcesIO from "@/classes/SwarmResources"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import useSelector from "@/state/useSelector"

export default function useVideosResources(videos: Video[] | undefined) {
  const { gatewayClient, isStandaloneGateway } = useSelector(state => state.env)
  const { address } = useSelector(state => state.user)
  const [videosOffersStatus, setVideosOffersStatus] = useState<Record<string, VideoOffersStatus>>()
  const videosQueue = useRef<string[]>([])
  const mounted = useMounted()

  useEffect(() => {
    if (isStandaloneGateway) return

    if (videos) {
      fetchVideosStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, isStandaloneGateway])

  const fetchVideosStatus = useCallback(async () => {
    if (!videos) return
    if (!mounted.current) return

    try {
      const videosToFetch = videos.filter(
        video =>
          !videosOffersStatus?.[video.reference] && !videosQueue.current.includes(video.reference)
      )

      videosQueue.current = [...videosQueue.current, ...videosToFetch.map(video => video.reference)]

      const readers = videosToFetch.map(
        video => new SwarmResourcesIO.Reader(video, { gatewayClient })
      )
      await Promise.allSettled(readers.map(reader => reader.download()))

      const statuses: Record<string, VideoOffersStatus> = {
        ...videosOffersStatus,
      }

      for (const reader of readers) {
        statuses[reader.video.reference] = parseReaderStatus(reader, address)
      }

      videosQueue.current = []
      mounted.current && setVideosOffersStatus(statuses)
    } catch (error) {
      console.error(error)
    }
  }, [videos, videosOffersStatus, address, gatewayClient, mounted])

  const offerVideoResources = useCallback(
    async (video: Video) => {
      const writer = new SwarmResourcesIO.Writer(video, { gatewayClient })
      await writer.offerResources()
      const reader = new SwarmResourcesIO.Reader(video, { gatewayClient })
      await reader.download()
      const statuses = { ...videosOffersStatus }
      statuses[reader.video.reference] = parseReaderStatus(reader, address)
      setVideosOffersStatus(statuses)
    },
    [videosOffersStatus, address, gatewayClient]
  )

  const unofferVideoResources = useCallback(
    async (video: Video) => {
      const writer = new SwarmResourcesIO.Writer(video, { gatewayClient })
      await writer.unofferResources()
      const reader = new SwarmResourcesIO.Reader(video, { gatewayClient })
      await reader.download()
      const statuses = { ...videosOffersStatus }
      statuses[reader.video.reference] = parseReaderStatus(reader, address)
      setVideosOffersStatus(statuses)
    },
    [videosOffersStatus, address, gatewayClient]
  )

  return {
    videosOffersStatus,
    offerVideoResources,
    unofferVideoResources,
  }
}
