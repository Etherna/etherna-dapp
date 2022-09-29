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

import { useEffect, useRef, useState } from "react"
import type { GatewayBatch, PostageBatch } from "@etherna/api-js/clients"
import { BatchesHandler } from "@etherna/api-js/handlers"
import { BatchUpdateType } from "@etherna/api-js/stores"
import { getBatchSpace, parseGatewayBatch, parsePostageBatch } from "@etherna/api-js/utils"

import useBeeAuthentication from "./useBeeAuthentication"
import BeeClient from "@/classes/BeeClient"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"
import dayjs from "@/utils/dayjs"

type UseBatchesOpts = {
  autofetch?: boolean
}

export default function useDefaultBatch(opts: UseBatchesOpts = { autofetch: false }) {
  const [isFetchingBatch, setIsFetchingBatch] = useState(false)
  const [isCreatingBatch, setIsCreatingBatch] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const address = useUserStore(state => state.address)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const defaultBatch = useUserStore(state => state.batches.find(b => b.id === defaultBatchId))
  const updateBeeClient = useClientsStore(state => state.updateBeeClient)
  const setBatches = useUserStore(state => state.setBatches)
  const setDefaultBatchId = useUserStore(state => state.setDefaultBatchId)
  const isLoadingProfile = useUIStore(state => state.isLoadingProfile)
  const { waitAuth } = useBeeAuthentication()
  const timeout = useRef<number>()

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(timeout.current)
    }
  }, [])

  useEffect(() => {
    if (!opts.autofetch) return
    if (isLoadingProfile) return

    fetchBatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.autofetch, isLoadingProfile])

  const fetchBatch = async () => {
    setIsFetchingBatch(true)

    let batch = await fetchDefaultBatch()

    if (!batch) {
      batch = await fetchBestUsableBatch()
    }

    if (!batch) {
      batch = await createDefaultBatch()
    }

    setIsFetchingBatch(false)

    if (batch) {
      updateBeeClient(
        new BeeClient(beeClient.url, {
          axios: beeClient.request,
          postageBatches: [parseGatewayBatch(batch)],
          signer: beeClient.signer,
        })
      )
      setDefaultBatchId(batch.id)
    }
  }

  const fetchDefaultBatch = async () => {
    if (!defaultBatchId) return null

    try {
      if (gatewayType === "etherna-gateway") {
        return await gatewayClient.users.fetchBatch(defaultBatchId)
      } else {
        await waitAuth()

        const batch = await beeClient.stamps.download(defaultBatchId)
        return parsePostageBatch(batch)
      }
    } catch {
      return null
    }
  }

  const fetchBestUsableBatch = async (): Promise<GatewayBatch | null> => {
    try {
      if (gatewayType === "etherna-gateway") {
        const batchesPreviews = (await gatewayClient.users.fetchBatches()).reverse()

        for (const batchPreview of batchesPreviews) {
          const batch = await gatewayClient.users.fetchBatch(batchPreview.batchId)
          if (batch.usable) {
            return batch
          }
        }

        return null
      } else {
        await waitAuth()

        const batches = await beeClient.stamps.downloadAll()
        const bestBatch = batches
          .filter(batch => batch.usable)
          .sort((a, b) => {
            const scoreA =
              getBatchSpace(a).available * (a.batchTTL / dayjs.duration(1, "day").asSeconds())
            const scoreB =
              getBatchSpace(b).available * (b.batchTTL / dayjs.duration(1, "day").asSeconds())
            return scoreB - scoreA
          })[0]

        if (!bestBatch) return null
        else return parsePostageBatch(bestBatch)
      }
    } catch (error) {
      return null
    }
  }

  const createDefaultBatch = async (): Promise<GatewayBatch | null> => {
    setIsCreatingBatch(true)
    setError(undefined)

    const batchesManager = new BatchesHandler({
      address: address!,
      beeClient,
      gatewayClient,
      gatewayType,
      network: import.meta.env.DEV ? "testnet" : "mainnet",
    })
    const depth = 20
    const { amount } = await batchesManager.calcDepthAmount(
      0,
      dayjs.duration(2, "years").asSeconds()
    )

    try {
      if (gatewayType === "etherna-gateway") {
        const batch = await gatewayClient.users.createBatch(depth, amount)
        return batch
      } else {
        await waitAuth()

        const batchId = await beeClient.stamps.create(depth, amount)
        let batch = await beeClient.stamps.download(batchId)
        batch = (await batchesManager.waitBatchPropagation(
          batch,
          BatchUpdateType.Create
        )) as PostageBatch

        return parsePostageBatch(batch)
      }
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setIsCreatingBatch(false)
    }
  }

  return {
    isCreatingBatch,
    isFetchingBatch,
    error,
    defaultBatch,
    fetchDefaultBatch,
  }
}
