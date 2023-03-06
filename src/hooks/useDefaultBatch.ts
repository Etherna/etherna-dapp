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

import type { GatewayBatch, PostageBatch } from "@etherna/api-js/clients"

type UseBatchesOpts = {
  autofetch?: boolean
  autoCreate?: boolean
}

export default function useDefaultBatch(opts: UseBatchesOpts = { autofetch: false }) {
  const [isFetchingBatch, setIsFetchingBatch] = useState(false)
  const [isCreatingBatch, setIsCreatingBatch] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const defaultBatch = useUserStore(state => state.batches.find(b => b.id === defaultBatchId))
  const updateBeeClient = useClientsStore(state => state.updateBeeClient)
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
    if (isLoadingProfile || isFetchingBatch) return
    // wait for the auth token
    if (!gatewayClient.accessToken) return

    fetchBatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.autofetch, isLoadingProfile, gatewayClient])

  const fetchDefaultBatch = useCallback(async () => {
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
  }, [beeClient, gatewayClient, defaultBatchId, gatewayType, waitAuth])

  const fetchBestUsableBatch = useCallback(async (): Promise<GatewayBatch | null> => {
    try {
      if (gatewayType === "etherna-gateway") {
        const batchesPreviews = await gatewayClient.users.fetchBatches()

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
  }, [beeClient.stamps, gatewayClient.users, gatewayType, waitAuth])

  const updateDefaultBatch = useCallback(
    (batch: GatewayBatch) => {
      updateBeeClient(
        new BeeClient(beeClient.url, {
          axios: beeClient.request,
          postageBatches: [parseGatewayBatch(batch)],
          signer: beeClient.signer,
        })
      )
      setDefaultBatchId(batch.id)
    },
    [beeClient, setDefaultBatchId, updateBeeClient]
  )

  const createDefaultBatch = useCallback(async (): Promise<GatewayBatch | null> => {
    setIsCreatingBatch(true)
    setError(undefined)

    const batchesManager = new BatchesHandler({
      beeClient,
      gatewayClient,
      gatewayType,
      network: import.meta.env.DEV ? "testnet" : "mainnet",
    })
    const depth = 17
    const { amount } = await batchesManager.calcDepthAmount(
      0,
      dayjs.duration(1, "years").asSeconds()
    )

    let batch: GatewayBatch | null = null

    try {
      if (gatewayType === "etherna-gateway") {
        batch = await gatewayClient.users.createBatch(depth, amount)
      } else {
        await waitAuth()

        const batchId = await beeClient.stamps.create(depth, amount)
        let beeBatch = await beeClient.stamps.download(batchId)
        beeBatch = (await batchesManager.waitBatchPropagation(
          beeBatch,
          BatchUpdateType.Create
        )) as PostageBatch

        batch = parsePostageBatch(beeBatch)
      }
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setIsCreatingBatch(false)
    }

    batch && updateDefaultBatch(batch)
    return batch
  }, [beeClient, gatewayClient, gatewayType, waitAuth, updateDefaultBatch])

  const fetchBatch = useCallback(async () => {
    setIsFetchingBatch(true)

    let batch = await fetchDefaultBatch()

    if (!batch) {
      batch = await fetchBestUsableBatch()
    }

    if (!batch && opts.autoCreate) {
      batch = await createDefaultBatch()
    }

    setIsFetchingBatch(false)

    if (batch) {
      updateDefaultBatch(batch)
    } else {
      setError("No usable batch found")
    }
  }, [
    opts.autoCreate,
    fetchDefaultBatch,
    fetchBestUsableBatch,
    createDefaultBatch,
    updateDefaultBatch,
  ])

  return {
    isCreatingBatch,
    isFetchingBatch,
    error,
    defaultBatch,
    fetchDefaultBatch,
    createDefaultBatch,
  }
}
