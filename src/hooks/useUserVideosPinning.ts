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
import { EthernaPinningHandler } from "@etherna/sdk-js/handlers"
import { extractVideoReferences } from "@etherna/sdk-js/utils"

import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"

import type { Video } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"
import type { SwarmResourcePinStatus } from "@etherna/sdk-js/handlers/pinning/types"

export type VideoStatus = "public" | "processing" | "unindexed" | "error"

export default function useUserVideosPinning(videos: Video[] | undefined) {
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const gatewayClientType = useExtensionsStore(state => state.currentGatewayType)
  const [isFetchingPinning, setIsFetchingPinning] = useState(false)
  const [pinningStatus, setPinningStatus] = useState<Record<string, SwarmResourcePinStatus>>({})

  useEffect(() => {
    if (videos?.length && !isFetchingPinning) {
      fetchVideosStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  const getVideoStatus = useCallback(
    (handler: EthernaPinningHandler, video: Video): SwarmResourcePinStatus => {
      const references = extractVideoReferences(video)
      const freePinningEndOfLife = handler.getReferenceStatus(video.reference)?.freePinningEndOfLife
      const isPinned = references.every(ref => handler.getReferenceStatus(ref)?.isPinned)
      const isPinningInProgress = references.some(
        ref => handler.getReferenceStatus(ref)?.isPinningInProgress
      )
      const isPinningRequired = references.some(
        ref => handler.getReferenceStatus(ref)?.isPinningRequired
      )

      return {
        reference: video.reference as Reference,
        freePinningEndOfLife,
        isPinned,
        isPinningInProgress,
        isPinningRequired,
      }
    },
    []
  )

  const fetchVideosStatus = useCallback(async () => {
    if (!videos?.length) return

    setIsFetchingPinning(true)

    try {
      const handler = new EthernaPinningHandler(videos, {
        client: gatewayClientType === "bee" ? beeClient : gatewayClient,
      })
      await handler.fetchPins()

      setPinningStatus(
        videos.reduce((acc, video) => {
          return {
            ...acc,
            [video.reference]: getVideoStatus(handler, video),
          }
        }, {})
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetchingPinning(false)
    }
  }, [beeClient, gatewayClient, gatewayClientType, getVideoStatus, videos])

  const togglePinning = useCallback(
    async (video: Video, pin: boolean) => {
      if (!video) return

      const handler = new EthernaPinningHandler([video], {
        client: gatewayClientType === "bee" ? beeClient : gatewayClient,
      })

      // optimistic ui
      setPinningStatus(status => ({
        ...status,
        [video.reference]: {
          reference: video.reference as Reference,
          isPinned: pin,
          isPinningInProgress: true,
          isPinningRequired: true,
        },
      }))

      if (pin) {
        await handler.pinResources()
      } else {
        await handler.unpinResources()
      }
    },
    [beeClient, gatewayClient, gatewayClientType]
  )

  return {
    isFetchingPinning,
    pinningStatus,
    togglePinning,
  }
}
