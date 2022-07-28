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

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import type { PostageBatch } from "@ethersphere/bee-js"
import type { Dispatch } from "redux"

import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import useSelector from "@/state/useSelector"
import { EnvActions, EnvActionTypes } from "@/state/reducers/enviromentReducer"
import { UserActions, UserActionTypes } from "@/state/reducers/userReducer"
import { useBeeAuthentication } from "@/state/hooks/ui"
import dayjs from "@/utils/dayjs"
import { getBatchSpace } from "@/utils/batches"
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

  useEffect(() => {
    if (!opts.autofetch) return
    if (isLoadingProfile) return

    fetchBatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.autofetch, isLoadingProfile])

  const fetchBatches = async () => {
    if (gatewayType === "etherna-gateway") {
      fetchGatewayBatch()
    } else {
      fetchBeeBatch()
    }
  }

  async function fetchGatewayBatch() {
    setIsFetchingBatches(true)

    let batch: GatewayBatch | undefined = undefined
    try {
      if (defaultBatchId) {
        batch = await gatewayClient.users.fetchBatch(defaultBatchId)
      } else {
        const batches = await gatewayClient.users.fetchBatches()

        if (batches.length === 0) {
          setIsCreatingBatch(true)
          console.warn("Creating default batch....")
          setTimeout(() => {
            return fetchGatewayBatch()
          }, 2500)
        } else {
          setIsCreatingBatch(false)
          batch = await gatewayClient.users.fetchBatch(batches[batches.length - 1].batchId)
        }
      }
    } catch (error: any) {
      console.error(error)
      setError(error.response?.data || error.message || error.toString())
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

    setIsFetchingBatches(false)
  }

  async function fetchBeeBatch() {
    setIsFetchingBatches(true)

    let postageBatch: PostageBatch | undefined = undefined
    try {
      postageBatch = await beeClient.getBatch(defaultBatchId!)
    } catch (error: any) {
      console.error(error)

      await waitAuth()

      // get best batch
      const batches = await beeClient.getAllPostageBatches()
      const bestBatch = batches
        .filter(batch => batch.usable)
        .sort((a, b) => getBatchSpace(b).available - getBatchSpace(a).available)[0]

      if (bestBatch) {
        postageBatch = bestBatch
      } else {
        // create a new batch
        setIsCreatingBatch(true)

        const batchManager = new SwarmBatchesManager({ beeClient, gatewayClient, address: address!, gatewayType })
        const { amount, depth } = await batchManager.calcDepthAmount(
          2 ** 20 * 100, // 100MB
          dayjs.duration(10, "years").asSeconds()
        )
        postageBatch = await beeClient.createBatch(depth, amount)

        setIsCreatingBatch(false)
      }
    }

    if (postageBatch) {
      const batch: GatewayBatch = {
        id: postageBatch.batchID,
        amountPaid: 0,
        normalisedBalance: 0,
        ownerAddress: address ?? null,
        amount: postageBatch.amount,
        batchTTL: postageBatch.batchTTL,
        blockNumber: postageBatch.blockNumber,
        bucketDepth: postageBatch.bucketDepth,
        depth: postageBatch.depth,
        exists: postageBatch.exists,
        immutableFlag: postageBatch.immutableFlag,
        label: postageBatch.label,
        usable: postageBatch.usable,
        utilization: postageBatch.utilization,
      }

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

      setIsFetchingBatches(false)
    }
  }

  return {
    isCreatingBatch,
    isFetchingBatches,
    error,
    defaultBatch,
    fetchBatches,
  }
}
