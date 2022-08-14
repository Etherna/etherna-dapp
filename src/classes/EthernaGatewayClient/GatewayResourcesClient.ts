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

export default class GatewayResourcesClient {
  url: string
  abortController?: AbortController

  /**
   * Init an gateway settings client
   * 
   * @param url Api host + api url
   */
  constructor(url: string, abortController?: AbortController) {
    this.url = url
    this.abortController = abortController
  }

  /**
   * Check if a resource is offered
   * 
   * @param reference Hash of the resource
   * @returns True if has offers
   */
  async fetchIsOffered(reference: string) {
    const endpoint = `${this.url}/resources/${reference}/isoffered`

    const resp = await http.get<boolean>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "boolean") {
      throw new Error("Cannot fetch byte price")
    }

    return resp.data
  }

  /**
   * Get all resource offers
   * 
   * @param reference Hash of the resource
   * @returns Addresses of users that are offering the resource
   */
  async fetchOffers(reference: string) {
    const endpoint = `${this.url}/resources/${reference}/offers`

    const resp = await http.get<string[]>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch byte price")
    }

    return resp.data
  }

  /**
   * Offer a resource
   * 
   * @param reference Hash of the resource
   * @returns True if successfull
   */
  async offer(reference: string) {
    const endpoint = `${this.url}/resources/${reference}/offers`

    await http.post(endpoint, undefined, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    return true
  }

  /**
   * Cancel a resource offer
   * 
   * @param reference Hash of the resource
   * @returns True if successfull
   */
  async cancelOffer(reference: string) {
    const endpoint = `${this.url}/resources/${reference}/offers`

    await http.delete(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    return true
  }
}
