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

import http from "@utils/request"
import type { GatewayBatch, GatewayBatchPreview, GatewayCredit, GatewayCurrentUser } from "@definitions/api-gateway"

export default class GatewayUsersClient {
  url: string

  /**
   * Init an gateway user client
   * 
   * @param {string} url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Get the current logged user's info
   * @returns Gateway current user
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get<GatewayCurrentUser>(endpoint, {
      withCredentials: true
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
      withCredentials: true
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
      withCredentials: true
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch user's batches")
    }

    return resp.data
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
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user's batch")
    }

    return resp.data
  }

  /**
   * Get current user's offered resources
   * 
   * @returns Reference list of offered resources
   */
  async fetchOfferedResources() {
    const endpoint = `${this.url}/users/current/offeredResources`

    const resp = await http.get<string[]>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user's offered resources")
    }

    return resp.data
  }
}
