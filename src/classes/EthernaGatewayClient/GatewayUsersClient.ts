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

import type {
  GatewayBatch,
  GatewayBatchPreview,
  GatewayCredit,
  GatewayCurrentUser,
} from "@/definitions/api-gateway"
import http from "@/utils/request"

export default class GatewayUsersClient {
  url: string
  abortController?: AbortController

  /**
   * Init an gateway user client
   *
   * @param {string} url Api host + api url
   */
  constructor(url: string, abortController?: AbortController) {
    this.url = url
    this.abortController = abortController
  }

  /**
   * Get the current logged user's info
   * @returns Gateway current user
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get<GatewayCurrentUser>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get current user's credit
   *
   * @returns User's credit amount
   */
  async fetchCredit() {
    const endpoint = `${this.url}/users/current/credit`

    const resp = await http.get<GatewayCredit>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user's credit")
    }

    return resp.data
  }

  /**
   * Get current user's batches
   *
   * @returns User's list of batches
   */
  async fetchBatches() {
    const endpoint = `${this.url}/users/current/batches`

    const resp = await http.get<GatewayBatchPreview[]>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch user's batches")
    }

    return resp.data
  }

  /**
   * Create a new batch
   *
   * @param depth Depth of the batch (size)
   * @param amount Amount of the batch (TTL)
   * @returns The newly created batch
   */
  async createBatch(depth: number, amount: bigint | string): Promise<GatewayBatch> {
    const endpoint = `${this.url}/users/current/batches`

    const resp = await http.post<string>(endpoint, null, {
      params: {
        depth,
        amount,
      },
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    const referenceId = resp.data

    if (typeof referenceId !== "string") {
      throw new Error("Coudn't create a new batch")
    }

    let resolver: (batch: GatewayBatch) => void
    let timeout: number
    let newBatchId: string

    const fetchBatch = async () => {
      clearTimeout(timeout)

      timeout = window.setTimeout(async () => {
        try {
          if (!newBatchId) {
            newBatchId = await this.fetchPostageBatchRef(referenceId)
          }
          if (newBatchId) {
            const batch = await this.fetchBatch(newBatchId)
            return resolver(batch)
          }
        } catch {}

        fetchBatch()
      }, 5000)
    }

    return await new Promise<GatewayBatch>(resolve => {
      resolver = resolve
      fetchBatch()
    })
  }

  /**
   * Get current user's batches
   *
   * @param batchId Id of the swarm batch
   * @returns User's list of batches
   */
  async fetchBatch(batchId: string) {
    const endpoint = `${this.url}/users/current/batches/${batchId}`

    const resp = await http.get<GatewayBatch>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user's batch")
    }

    return resp.data
  }

  /**
   * Dilute batch (increase size)
   *
   * @param batchId Id of the swarm batch
   * @param depth New batch depth
   */
  async diluteBatch(batchId: string, depth: number) {
    const endpoint = `${this.url}/users/current/batches/${batchId}/dilute/${depth}`

    await http.patch(endpoint, null, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    return true
  }

  /**
   * Get current user's offered resources
   *
   * @returns Reference list of offered resources
   */
  async fetchOfferedResources() {
    const endpoint = `${this.url}/users/current/offeredResources`

    const resp = await http.get<string[]>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user's offered resources")
    }

    return resp.data
  }

  // SYSTEM

  /**
   * Fetch creation batch id
   *
   * @param referenceId Reference id of the batch
   * @returns The created batch id if completed
   */
  async fetchPostageBatchRef(referenceId: string) {
    const endpoint = `${this.url}/system/postagebatchref/${referenceId}`

    const resp = await http.get<string>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    const batchId = resp.data

    if (!batchId || typeof resp.data !== "string") {
      throw new Error("Batch still processing")
    }

    return batchId
  }
}
