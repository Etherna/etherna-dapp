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

import { useCallback, useRef, useState } from "react"
import { parsePostageBatch } from "@etherna/sdk-js/utils"

import useBeeAuthentication from "./useBeeAuthentication"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"

import type {
  BatchId,
  GatewayBatch,
  GatewayBatchPreview,
  PostageBatch,
} from "@etherna/sdk-js/clients"

type UseBatchesOpts = {
  limit?: number
}

export default function useBatches(opts?: UseBatchesOpts) {
  const [isFetchingBatches, setIsFetchingBatches] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [total, setTotal] = useState(0)
  const [isCreatingFirstBatch, setIsCreatingFirstBatch] = useState(false)
  const [batches, setBatches] = useState<GatewayBatch[]>()
  const previewList = useRef<GatewayBatchPreview[]>()

  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const storeBatches = useUserStore(state => state.batches)
  const addBatches = useUserStore(state => state.addBatches)

  const { waitAuth } = useBeeAuthentication()

  const fetchPage = useCallback(
    async (page: number) => {
      setIsFetchingBatches(true)

      let pageBatches: GatewayBatch[] = []
      const limit = opts?.limit ?? 25

      const batchId = (batch: GatewayBatchPreview | PostageBatch) =>
        "batchId" in batch ? batch.batchId : batch.batchID
      const defaultBatchAtFirst = (batch: GatewayBatchPreview | PostageBatch) =>
        batchId(batch) === defaultBatchId ? -1 : 0

      try {
        if (gatewayType === "etherna-gateway") {
          previewList.current =
            previewList.current ??
            (await gatewayClient.users.fetchBatches()).sort(defaultBatchAtFirst)
          const pageList = previewList.current.slice((page - 1) * limit, page * limit)

          const batchesResults = await Promise.allSettled(
            pageList.map(batchPreview => {
              const cachedBatch = storeBatches.find(b => b.id === batchPreview.batchId)
              if (cachedBatch) {
                return Promise.resolve(cachedBatch)
              } else {
                return gatewayClient.users.fetchBatch(batchPreview.batchId)
              }
            })
          )
          pageBatches = batchesResults.map((result, i) =>
            result.status === "fulfilled"
              ? result.value
              : ({
                  id: pageList[i].batchId,
                  amount: "0",
                  amountPaid: 0,
                  batchTTL: -1,
                  blockNumber: -1,
                  bucketDepth: -1,
                  depth: 0,
                  exists: false,
                  immutableFlag: false,
                  normalisedBalance: 0,
                  usable: false,
                  utilization: 0,
                  label: "",
                } as GatewayBatch)
          )
          addBatches(pageBatches)
          setTotal(previewList.current.length)

          if (previewList.current.length === 0) {
            setIsCreatingFirstBatch(true)
          }
        } else {
          if (storeBatches.length > 0) {
            // assuming batches have laready been downloaded from bee node
            pageBatches = storeBatches.slice((page - 1) * limit, page * limit)
          }
          await waitAuth()

          const beeBatches = (await beeClient.stamps.downloadAll())
            .sort(defaultBatchAtFirst)
            .map(parsePostageBatch)
          addBatches(beeBatches)
          setTotal(beeBatches.length)

          pageBatches = beeBatches.slice((page - 1) * limit, page * limit)
        }

        setBatches(pageBatches)
      } catch (error: any) {
        setError(error.message)
      }

      setIsFetchingBatches(false)
    },
    [
      opts?.limit,
      defaultBatchId,
      gatewayType,
      gatewayClient,
      beeClient,
      storeBatches,
      waitAuth,
      addBatches,
    ]
  )

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
    batches,
    total,
    isFetchingBatches,
    error,
    isCreatingFirstBatch,
    fetchPage,
    updateBatch,
  }
}
