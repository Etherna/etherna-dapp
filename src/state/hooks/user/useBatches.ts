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
import type { Dispatch } from "redux"

import useSelector from "@/state/useSelector"
import { EnvActions, EnvActionTypes } from "@/state/reducers/enviromentReducer"
import { UserActions, UserActionTypes } from "@/state/reducers/userReducer"
import type { GatewayBatch, GatewayBatchPreview } from "@/definitions/api-gateway"

let batchesFetchTries = 0

type UseBatchesOpts = {
  autofetch?: boolean
}

export default function useBatches(opts: UseBatchesOpts = { autofetch: false }) {
  const [isFetchingBatches, setIsFetchingBatches] = useState(false)
  const { gatewayClient, beeClient } = useSelector(state => state.env)
  const { batches } = useSelector(state => state.user)
  const dispatch = useDispatch<Dispatch<UserActions | EnvActions>>()

  useEffect(() => {
    if (!opts.autofetch) return
    if (!batches || !batches.length) {
      fetchBatches()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.autofetch])

  const fetchBatches = async () => {
    batchesFetchTries++

    let userBatches: GatewayBatch[] = []
    let batchesPreview: GatewayBatchPreview[] = []

    try {
      setIsFetchingBatches(true)

      batchesPreview = await gatewayClient.users.fetchBatches()

      if (batchesPreview.length === 0) {
        // waiting to auto create default batch
        console.warn("Still no batches. Re-Trying in 10 seconds.")
        batchesFetchTries < 5 && setTimeout(() => {
          fetchBatches()
        }, 10000)
        return
      }

      userBatches = await Promise.all(
        batchesPreview.map(batchPreview => gatewayClient.users.fetchBatch(batchPreview.batchId))
      )
    } catch (error) {
      if (batchesPreview.length > 0 && import.meta.env.PROD) {
        userBatches = batchesPreview.map(batchPreview => ({
          id: batchPreview.batchId,
          depth: 20,
          bucketDepth: 0,
          amountPaid: 0,
          normalisedBalance: 0,
          batchTTL: 0,
          usable: false,
          utilization: 0,
          blockNumber: 0,
          exists: false,
          immutableFlag: false,
          label: "",
          ownerAddress: null,
        }))
      } else {
        // Try to fetch from /stamps endpoint
        const batches = await beeClient.getAllPostageBatch()
        const usableBatches = batches.filter(batch => batch.usable)
        userBatches = usableBatches.map(batch => ({
          id: batch.batchID,
          depth: batch.depth,
          bucketDepth: batch.bucketDepth,
          amountPaid: +batch.amount,
          normalisedBalance: 0,
          batchTTL: -1,
          usable: batch.usable,
          utilization: batch.utilization,
          blockNumber: batch.blockNumber,
          exists: true,
          immutableFlag: batch.immutableFlag,
          label: batch.label,
          ownerAddress: null,
        }))
      }
    }

    dispatch({
      type: EnvActionTypes.UPDATE_BEE_CLIENT_BATCHES,
      batches: userBatches,
    })

    dispatch({
      type: UserActionTypes.USER_SET_BATCHES,
      batches: userBatches,
    })

    setIsFetchingBatches(false)
  }

  return {
    isFetchingBatches,
    batches,
    fetchBatches,
  }
}
