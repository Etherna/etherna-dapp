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

import { useMemo, useState } from "react"
import type { Dayjs } from "dayjs"
import type { PostageBatch } from "@ethersphere/bee-js"

import useSelector from "@/state/useSelector"
import useBeeAuthentication from "@/state/hooks/ui/useBeeAuthentication"
import { useErrorMessage } from "@/state/hooks/ui"
import { getBatchExpiration, getBatchSpace } from "@/utils/batches"

export default function useBatchId(initBatchId?: string) {
  const { beeClient, gatewayClient, gatewayType } = useSelector(state => state.env)
  const { waitAuth } = useBeeAuthentication()
  const { showError } = useErrorMessage()

  const [isFetchingBatch, setIsFetchingBatch] = useState(false)
  const [batchId, setBatchId] = useState(initBatchId)
  const [batch, setBatch] = useState<PostageBatch>()

  const [batchSize, batchExpiration] = useMemo(() => {
    if (!batch) return [0, undefined]
    const { total } = getBatchSpace(batch)
    const expiration = getBatchExpiration(batch)
    return [total, expiration]
  }, [batch])

  async function authenticate() {
    if (gatewayType !== "bee" || beeClient.isAuthenticated) return true
    let token = beeClient.authToken
    if (token) {
      token = await beeClient.refreshToken(token)
    }

    if (!token) {
      return await waitAuth()
    } else {
      return true
    }
  }

  async function fetchBatch() {
    if (!batchId) {
      throw new Error("No batch id. Try creating a new one.")
    }

    if (!(await authenticate())) {
      throw new Error("Coudn't authenticate into current bee node.")
    }

    setIsFetchingBatch(true)

    try {
      const batch = gatewayType === "etherna-gateway"
        ? await gatewayClient.users.fetchBatch(batchId)
        : await beeClient.getBatch(batchId)

      setBatch({
        ...batch,
        batchID: "id" in batch ? batch.id : batch.batchID,
      })
    } catch (error: any) {
      console.error(error)
      showError("Cannot fetch batch", error.message || error.toString())
    }

    setIsFetchingBatch(false)
  }

  async function createBatch() {
    if (gatewayType === "etherna-gateway") {
      throw new Error("Not implemented")
    }

    if (!(await authenticate())) {
      throw new Error("Coudn't authenticate into current bee node.")
    }

    setIsFetchingBatch(true)

    try {
      const batch = await beeClient.createBatch()

      setBatch(batch)
      setBatchId(batch.batchID)
    } catch (error: any) {
      console.error(error)
      showError("Cannot fetch batch", error.message || error.toString())
    }

    setIsFetchingBatch(false)
  }

  return {
    isFetchingBatch,
    batchId,
    batch,
    batchSize,
    batchExpiration,
    fetchBatch,
    createBatch,
  }
}
