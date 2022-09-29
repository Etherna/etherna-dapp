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
import type { GatewayBatch } from "@etherna/api-js/clients"
import { parsePostageBatch } from "@etherna/api-js/utils"

import useBeeAuthentication from "./useBeeAuthentication"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"

type UseBatchesOpts = {
  autofetch?: boolean
}

export default function useBatches(opts: UseBatchesOpts = { autofetch: false }) {
  const [isFetchingBatches, setIsFetchingBatches] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const batches = useUserStore(state => state.batches)
  const isLoadingProfile = useUIStore(state => state.isLoadingProfile)
  const setBatches = useUserStore(state => state.setBatches)

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

    fetchAllBatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.autofetch, isLoadingProfile])

  const fetchAllBatches = useCallback(async () => {
    setIsFetchingBatches(true)

    let batches: GatewayBatch[] = []

    try {
      if (gatewayType === "etherna-gateway") {
        const batchesPreview = await gatewayClient.users.fetchBatches()
        const batchesResults = await Promise.allSettled(
          batchesPreview.map(async batchPreview =>
            gatewayClient.users.fetchBatch(batchPreview.batchId)
          )
        )
        batches = batchesResults
          // @ts-ignore
          .filter<PromiseFulfilledResult<GatewayBatch>>(result => result.status === "fulfilled")
          .map(result => result.value)
      } else {
        await waitAuth()

        batches = (await beeClient.stamps.downloadAll()).map(batch => parsePostageBatch(batch))
      }

      setBatches(batches)
    } catch (error: any) {
      setError(error.message)
    }

    setIsFetchingBatches(false)
  }, [gatewayClient, beeClient, gatewayType, waitAuth, setBatches])

  const updateBatch = useCallback(
    (batch: GatewayBatch) => {
      const updatedBatches = [...(batches ?? [])]
      const index = updatedBatches.findIndex(b => b.id === batch.id)
      if (index >= 0) {
        updatedBatches[index] = batch
      }

      setBatches(updatedBatches)
    },
    [batches, setBatches]
  )

  return {
    isFetchingBatches,
    error,
    fetchAllBatches,
    updateBatch,
  }
}
