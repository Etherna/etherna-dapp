import { useState } from "react"
import type { Dayjs } from "dayjs"

import useSelector from "@/state/useSelector"
import useBeeAuthentication from "@/state/hooks/ui/useBeeAuthentication"
import { useErrorMessage } from "@/state/hooks/ui"

export default function useBatchId(initBatchId?: string) {
  const { beeClient, gatewayClient, gatewayType } = useSelector(state => state.env)
  const { waitAuth } = useBeeAuthentication()
  const { showError } = useErrorMessage()

  const [batchId, setBatchId] = useState(initBatchId)
  const [mb, setMb] = useState<number>()
  const [expiration, setExpiration] = useState<Dayjs>()

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

    try {
      const batch = gatewayType === "etherna-gateway"
        ? await gatewayClient.users.fetchBatch(batchId)
        : await beeClient.getBatch(batchId)
    } catch (error: any) {
      console.error(error)
      showError("Cannot fetch batch", error.message || error.toString())
    }
  }

  return {
    batchId,
    fetchBatch,
  }
}
