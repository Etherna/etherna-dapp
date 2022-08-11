import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import type { GatewayBatch } from "@/definitions/api-gateway"
import type { BatchId, PostageBatch } from "@ethersphere/bee-js"

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
              b => b.id === id && b.depth === batch.depth && b.amount === batch.amount && b.flag === type
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
            state.updatingBatches.splice(state.updatingBatches.findIndex(b => b.id === batchId), 1)
          })
        },
      })),
      {
        name: "etherna:batches",
        getStorage: () => localStorage,
      }
    ),
  ),
)

export default useBatchesStore
