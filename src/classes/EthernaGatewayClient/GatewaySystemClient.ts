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

import http from "@/utils/request"
import type { GatewayChainState } from "@/definitions/api-gateway"

export default class GatewaySystemClient {
  url: string

  /**
   * Init an gateway settings client
   * 
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Get the current byte price
   * 
   * @returns Dollar price per single byte
   */
  async fetchCurrentBytePrice() {
    const endpoint = `${this.url}/system/byteprice`

    const resp = await http.get<number>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "number") {
      throw new Error("Cannot fetch byte price")
    }

    return resp.data
  }

  /**
   * Get the current chain state
   * 
   * @returns chain state object
   */
  async fetchChainstate() {
    const endpoint = `${this.url}/system/chainstate`

    const resp = await http.get<GatewayChainState>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch chainstate")
    }

    return resp.data
  }

  /**
   * Fetch creation batch id
   * 
   * @param referenceId Reference id of the batch
   * @returns The created batch id if completed
   */
  async fetchPostageBatchRef(referenceId: string) {
    const endpoint = `${this.url}/system/postagebatchref/${referenceId}`

    const resp = await http.get<string>(endpoint, {
      withCredentials: true
    })

    const batchId = resp.data

    return batchId
  }
}
