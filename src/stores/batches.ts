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

import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import type { BatchId, PostageBatch } from "@/classes/BeeClient/types"
import type { GatewayBatch } from "@/types/api-gateway"

export enum BatchUpdateType {
  Create = 1,
  Topup = 2,
  Dilute = 4,
}

export type UpdatingBatch = {
  id: BatchId
  depth: number
  amount: string
  flag: BatchUpdateType
}

export type BatchesState = {
  updatingBatches: UpdatingBatch[]
  addBatchUpdate(batch: PostageBatch | GatewayBatch | UpdatingBatch, type: BatchUpdateType): void
  removeBatchUpdate(batchId: BatchId): void
}

const useBatchesStore = create<BatchesState>()(
  devtools(
    persist(
      immer(set => ({
        updatingBatches: [],
        addBatchUpdate(batch, type) {
          set(state => {
            const id = "id" in batch ? batch.id : batch.batchID
            const index = state.updatingBatches.findIndex(
              b =>
                b.id === id &&
                b.depth === batch.depth &&
                b.amount === batch.amount &&
                b.flag === type
            )

            if (index === -1) {
              state.updatingBatches.push({
                id,
                depth: batch.depth,
                amount: batch.amount,
                flag: type,
              })
            }
          })
        },
        removeBatchUpdate(batchId) {
          set(state => {
            state.updatingBatches.splice(
              state.updatingBatches.findIndex(b => b.id === batchId),
              1
            )
          })
        },
      })),
      {
        name: "etherna:batches",
        getStorage: () => localStorage,
      }
    )
  )
)

export default useBatchesStore
