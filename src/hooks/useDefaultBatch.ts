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
import { BatchesHandler } from "@etherna/sdk-js/handlers"
import { BatchUpdateType } from "@etherna/sdk-js/stores"
import { getBatchSpace, parseGatewayBatch, parsePostageBatch } from "@etherna/sdk-js/utils"

import useBeeAuthentication from "./useBeeAuthentication"
import useConfirmation from "./useConfirmation"
import useSwarmProfile from "./useSwarmProfile"
import BeeClient from "@/classes/BeeClient"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"
import dayjs from "@/utils/dayjs"

import type { GatewayBatch, PostageBatch } from "@etherna/sdk-js/clients"

type UseBatchesOpts = {
  autofetch?: boolean
  autoCreate?: boolean
  saveAfterCreate?: boolean
}

export const DEFAULT_BATCH_QUERY = "default" // this will match welcome postage with manually created ones
export const DEFAULT_BATCH_LABEL = "user-default-stamp"

export default function useDefaultBatch(opts: UseBatchesOpts = { autofetch: false }) {
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const address = useUserStore(state => state.address)
  const profile = useUserStore(state => state.profile)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const defaultBatch = useUserStore(state => state.batches.find(b => b.id === defaultBatchId))
  const isLoadingProfile = useUIStore(state => state.isLoadingProfile)
  const updateBeeClient = useClientsStore(state => state.updateBeeClient)
  const setDefaultBatch = useUserStore(state => state.setDefaultBatch)
  const [error, setError] = useState<string | undefined>()
  const [isFetchingBatch, setIsFetchingBatch] = useState(false)
  const [isCreatingBatch, setIsCreatingBatch] = useState(false)
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const timeout = useRef<number>()
  const batchesCount = useRef(0)
  const { updateProfile } = useSwarmProfile({
    address: address!,
    prefetchedProfile: profile ?? undefined,
  })
  const { waitAuth } = useBeeAuthentication()
  const { waitConfirmation } = useConfirmation()

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
        const batchesPreviews = await gatewayClient.users.fetchBatches(DEFAULT_BATCH_QUERY)
        batchesCount.current = batchesPreviews.length

        for (const batchPreview of batchesPreviews.reverse()) {
          try {
            const batch = await gatewayClient.users.fetchBatch(batchPreview.batchId)
            if (batch.usable) {
              return batch
            }
          } catch {}
        }

        return null
      } else {
        await waitAuth()

        const batches = await beeClient.stamps.downloadAll(DEFAULT_BATCH_QUERY)
        batchesCount.current = batches.length
        const bestBatch = batches
          .reverse()
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
      console.error(error)
      return null
    }
  }, [beeClient.stamps, gatewayClient.users, gatewayType, waitAuth])

  const updateDefaultBatch = useCallback(
    async (batch: GatewayBatch, saveProfile = false) => {
      updateBeeClient(
        new BeeClient(beeClient.url, {
          axios: beeClient.request,
          postageBatches: [parseGatewayBatch(batch)],
          signer: beeClient.signer,
        })
      )
      setDefaultBatch(batch)

      if (opts.saveAfterCreate && saveProfile) {
        setIsWaitingForConfirmation(true)

        const save = await waitConfirmation(
          "Save changes?",
          "You have changed your default batch. Do you want to save these changes?",
          "Save"
        )

        setIsWaitingForConfirmation(false)

        if (!save) return

        setIsUpdatingProfile(true)

        await updateProfile({
          address: address!,
          avatar: profile?.avatar ?? null,
          cover: profile?.cover ?? null,
          description: profile?.description ?? null,
          name: profile?.name ?? address!,
          birthday: profile?.birthday,
          location: profile?.location,
          website: profile?.website,
          batchId: batch.id,
        })

        setIsUpdatingProfile(false)
      }
    },
    [
      opts.saveAfterCreate,
      beeClient,
      address,
      profile,
      updateBeeClient,
      setDefaultBatch,
      waitConfirmation,
      updateProfile,
    ]
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
      const label = `${DEFAULT_BATCH_LABEL}-${batchesCount.current || 1}`
      if (gatewayType === "etherna-gateway") {
        batch = await gatewayClient.users.createBatch(depth, amount, label)
      } else {
        await waitAuth()

        const batchId = await beeClient.stamps.create(depth, amount, label)
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

    batch && (await updateDefaultBatch(batch, true))
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
      await updateDefaultBatch(batch)
    } else {
      setError("No usable batch found")
      setDefaultBatch(undefined)
    }
  }, [
    opts.autoCreate,
    fetchDefaultBatch,
    fetchBestUsableBatch,
    createDefaultBatch,
    updateDefaultBatch,
    setDefaultBatch,
  ])

  return {
    isCreatingBatch,
    isFetchingBatch,
    isWaitingForConfirmation,
    isUpdatingProfile,
    error,
    defaultBatch,
    fetchDefaultBatch,
    createDefaultBatch,
  }
}
