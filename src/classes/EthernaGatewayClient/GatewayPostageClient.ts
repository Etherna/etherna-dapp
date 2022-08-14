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

export default class GatewayPostageClient {
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
   * Topup batch (increase TTL)
   * 
   * @param batchId Id of the swarm batch
   * @param byAmount Amount to add to the batch
   */
  async topupBatch(batchId: string, byAmount: number | string) {
    const endpoint = `${this.url}/postage/batches/${batchId}/topup/${byAmount}`

    await http.patch(endpoint, null, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    return true
  }

}
