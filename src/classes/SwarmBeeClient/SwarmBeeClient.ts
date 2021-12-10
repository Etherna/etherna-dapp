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

import { BatchId, Bee, Collection, PostageBatch, UploadResult } from "@ethersphere/bee-js"

import { AxiosUploadOptions, CustomUploadOptions } from "./customUpload"
import http, { createRequest } from "@utils/request"
import { buildAxiosFetch } from "@utils/fetch"

export type MultipleFileUpload = { buffer: Uint8Array, type?: string }[]

/**
 * Extend default Bee client with more functionalities and endpoints
 */
export default class SwarmBeeClient extends Bee {

  /**
   * Create custom fetch implementation that accept upload progress and canceler
   */
  getFetch(options?: AxiosUploadOptions) {
    const request = createRequest()
    request.defaults.onUploadProgress = options?.onUploadProgress
    request.defaults.cancelToken = options?.cancelToken
    return buildAxiosFetch(request) as typeof fetch
  }

  /**
   * Add content to a directory returning the new hash
   * @param opts Upload options
   * @returns The new manifest hash
   */
  uploadToDir(data: Collection<Uint8Array>, opts?: CustomUploadOptions): Promise<string> {
    throw new Error("Not implemented yet")
  }

  /**
   * Delete content from a directory returning the new hash
   * @param reference Directory manifest hash
   * @param path Resource path to delete
   * @returns The new manifest hash
   */
  deleteFromDir(reference: string, path: string): Promise<string> {
    throw new Error("Not implemented yet")
  }

  /**
   * Add content to a directory returning the new hash
   * @param batchId Postage batch id
   * @param data List of files to upload
   * @param opts Upload options
   * @returns The new manifest hash
   */
  async uploadMultipleFiles(
    batchId: string | BatchId,
    data: MultipleFileUpload,
    opts?: CustomUploadOptions
  ): Promise<UploadResult[]> {
    return await Promise.all(
      data.map(data => this.uploadFile(batchId, data.buffer, undefined, { contentType: data.type }))
    )
  }

  /**
   * Get the bzz url from referance and path
   * @param reference Bee resource reference
   * @param path Resource path
   * @returns The resource url
   */
  getBzzUrl(reference: string, path?: string) {
    const hash = reference.replaceAll(/(^\/|\/$)/ig, "")
    const safePath = path?.replaceAll(/(^\/|\/$)/ig, "")
    return `${this.url}/bzz/${hash}/${safePath ?? ""}`
  }

  /**
   * Get the file url from referance
   * @param reference Bee resource reference
   * @returns The resource url
   */
  getFileUrl(reference: string) {
    const hash = reference?.replaceAll(/(^\/|\/$)/ig, "")
    return `${this.url}/bzz/${hash}`
  }

  /**
   * Download a resource from swarm by the bzz path
   * @param reference Bee resource reference
   * @param path Resource path
   * @returns The data array
   */
  async resolveBzz(reference: string, path?: string) {
    const url = this.getBzzUrl(reference, path)
    const response = await http.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
    })
    return new Uint8Array(response.data)
  }

  /**
   * Check if pinning is enabled on the current host
   * @returns True if pinning is enabled
   */
  async pinEnabled() {
    try {
      const endpoint = `${this.url}/pin/chunks`
      await http.get(endpoint, {
        params: {
          offset: 0,
          limit: 1
        }
      })
      return true
    } catch (error: any) {
      return false
    }
  }

  async getAllPostageBatch() {
    try {
      const postageResp = await http.get<{ stamps: PostageBatch[] }>(import.meta.env.VITE_APP_POSTAGE_URL)
      return postageResp.data.stamps
    } catch (error) {
      return []
    }
  }

  async getBatchId() {
    const batches = await this.getAllPostageBatch()
    const usableBatches = batches.filter(batch => batch.usable)
    return usableBatches[0]?.batchID
  }

  /**
   * Check if an hash is a valid swarm hash
   * @param hash Hash string
   * @returns True if the hash is valid
   */
  static isValidHash = (hash: string) => {
    return /^[0-9a-f]{64}$/.test(hash)
  }

}
