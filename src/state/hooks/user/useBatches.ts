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
import type { Dispatch } from "redux"

import useSelector from "@/state/useSelector"
import { UserActions, UserActionTypes } from "@/state/reducers/userReducer"
import { useBeeAuthentication } from "@/state/hooks/ui"
import { parsePostageBatch } from "@/utils/batches"
import type { GatewayBatch } from "@/definitions/api-gateway"

type UseBatchesOpts = {
  autofetch?: boolean
}

export default function useBatches(opts: UseBatchesOpts = { autofetch: false }) {
  const [isFetchingBatches, setIsFetchingBatches] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const { gatewayClient, gatewayType, beeClient } = useSelector(state => state.env)
  const { address } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)
  const dispatch = useDispatch<Dispatch<UserActions>>()
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

  const fetchAllBatches = async () => {
    setIsFetchingBatches(true)

    let batches: GatewayBatch[] = []

    try {
      if (gatewayType === "etherna-gateway") {
        const batchesPreview = await gatewayClient.users.fetchBatches()
        batches = await Promise.all(batchesPreview.map(
          async batchPreview => gatewayClient.users.fetchBatch(batchPreview.batchId)
        ))
      } else {
        await waitAuth()

        batches = (await beeClient.getAllPostageBatches()).map(batch => parsePostageBatch(batch, address))
      }

      dispatch({
        type: UserActionTypes.USER_SET_BATCHES,
        batches,
      })
    } catch (error: any) {
      setError(error.message)
    }

    setIsFetchingBatches(false)
  }

  return {
    isFetchingBatches,
    error,
    fetchAllBatches,
  }
}
