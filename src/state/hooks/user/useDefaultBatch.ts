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
import { useDispatch } from "react-redux"
import type { PostageBatch } from "@ethersphere/bee-js"
import type { Dispatch } from "redux"

import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import useSelector from "@/state/useSelector"
import { EnvActions, EnvActionTypes } from "@/state/reducers/enviromentReducer"
import { UserActions, UserActionTypes } from "@/state/reducers/userReducer"
import { useBeeAuthentication } from "@/state/hooks/ui"
import dayjs from "@/utils/dayjs"
import { getBatchSpace, parsePostageBatch } from "@/utils/batches"
import type { GatewayBatch } from "@/definitions/api-gateway"

type UseBatchesOpts = {
  autofetch?: boolean
}

export default function useBatches(opts: UseBatchesOpts = { autofetch: false }) {
  const [isFetchingBatches, setIsFetchingBatches] = useState(false)
  const [isCreatingBatch, setIsCreatingBatch] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const { gatewayClient, gatewayType, beeClient } = useSelector(state => state.env)
  const { defaultBatchId, defaultBatch, address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const dispatch = useDispatch<Dispatch<UserActions | EnvActions>>()
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
    let batch = await fetchDefaultBatch()

    if (!batch) {
      batch = await fetchBestUsableBatch()
    }

    if (!batch) {
      batch = await createDefaultBatch()
    }

    if (batch) {
      dispatch({
        type: EnvActionTypes.UPDATE_BEE_CLIENT_BATCHES,
        batches: [batch],
      })

      dispatch({
        type: UserActionTypes.USER_SET_DEFAULT_BATCH_ID,
        batchId: batch.id,
      })
      dispatch({
        type: UserActionTypes.USER_SET_DEFAULT_BATCH,
        batch,
      })
    }
  }

  const fetchDefaultBatch = async () => {
    if (!defaultBatchId) return null

    try {
      if (gatewayType === "etherna-gateway") {
        return await gatewayClient.users.fetchBatch(defaultBatchId)
      } else {
        await waitAuth()

        const batch = await beeClient.getBatch(defaultBatchId)
        return parsePostageBatch(batch, address)
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

        const batches = await beeClient.getAllPostageBatches()
        const bestBatch = batches
          .filter(batch => batch.usable)
          .sort((a, b) => {
            const scoreA = getBatchSpace(a).available * (a.batchTTL / dayjs.duration(1, "day").asSeconds())
            const scoreB = getBatchSpace(b).available * (b.batchTTL / dayjs.duration(1, "day").asSeconds())
            return scoreB - scoreA
          })[0]

        if (!bestBatch) return null
        else return parsePostageBatch(bestBatch, address)
      }
    } catch (error) {
      return null
    }
  }

  const createDefaultBatch = async (): Promise<GatewayBatch | null> => {
    setIsCreatingBatch(true)
    setError(undefined)

    const batchesManager = new SwarmBatchesManager({
      address: address!,
      beeClient,
      gatewayClient,
      gatewayType,
    })
    const depth = 20
    const { amount } = await batchesManager.calcDepthAmount(0, dayjs.duration(2, "years").asSeconds())

    try {
      if (gatewayType === "etherna-gateway") {
        const batch = await gatewayClient.users.createBatch(depth, amount)
        return batch
      } else {
        await waitAuth()

        const batchId = await beeClient.createBatch(depth, amount)
        let batch = await beeClient.getBatch(batchId)
        batch = await batchesManager.waitBatchPropagation(batch) as PostageBatch

        return parsePostageBatch(batch, address)
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
    isFetchingBatches,
    error,
    defaultBatch,
    fetchDefaultBatch,
  }
}
