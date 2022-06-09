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

import { Bee } from "@ethersphere/bee-js"
import type { BatchId, BeeOptions, PostageBatch, UploadResult } from "@ethersphere/bee-js"

import http, { createRequest } from "@/utils/request"
import { buildAxiosFetch } from "@/utils/fetch"
import type { AxiosFetch } from "@/utils/fetch"
import type { AxiosUploadOptions, CustomUploadOptions } from "./bee-client.d.ts"
import type { GatewayBatch } from "@/definitions/api-gateway"

export type MultipleFileUpload = { buffer: Uint8Array, type?: string }[]

/**
 * Extend default Bee client with more functionalities
 */
export default class SwarmBeeClient extends Bee {

  public stampsUrl?: string
  public userBatches: GatewayBatch[]
  public emptyBatchId = "0000000000000000000000000000000000000000000000000000000000000000" as BatchId

  constructor(url: string, options?: BeeOptions & { userBatches?: GatewayBatch[], stampsUrl?: string }) {
    const request = createRequest()
    request.defaults.withCredentials = true

    super(url, {
      ...options,
      fetch: buildAxiosFetch(request)
    })
    this.stampsUrl = options?.stampsUrl
    this.userBatches = options?.userBatches ?? []
  }

  /**
   * Create custom fetch implementation that accept upload progress and canceler
   */
  getFetch(options?: AxiosUploadOptions): AxiosFetch {
    const request = createRequest()
    request.defaults.onUploadProgress = options?.onUploadProgress
    request.defaults.cancelToken = options?.cancelToken
    request.defaults.withCredentials = true
    return buildAxiosFetch(request)
  }
  /**
   * Add content to a directory returning the new hash
   * 
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
      data.map(
        data => this.uploadFile(batchId, data.buffer, undefined, {
          ...opts,
          contentType: data.type,
        })
      )
    )
  }

  /**
   * Get the bzz url from referance and path
   * 
   * @param reference Bee resource reference
   * @param path Resource path
   * @returns The resource url
   */
  getBzzUrl(reference: string, path?: string) {
    const hash = reference.replace(/(^\/|\/$)/ig, "")
    const safePath = path?.replace(/(^\/|\/$)/ig, "")
    return `${this.url}/bzz/${hash}/${safePath ?? ""}`.replace(/\/?$/, "/")
  }

  /**
   * Download a resource from swarm by the bzz path
   * 
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
   * 
   * @returns True if pinning is enabled
   */
  async pinEnabled() {
    try {
      const controller = new AbortController()
      await http.get(`${import.meta.env.VITE_APP_GATEWAY_URL}/pins`, {
        signal: controller.signal,
        onDownloadProgress: (p) => {
          controller.abort()
        },
      })
      return true
    } catch {
      return false
    }
  }

  async getAllPostageBatch(): Promise<PostageBatch[]> {
    const stampsUrl = this.stampsUrl || this.url + "/stamps"

    try {
      const postageResp = await http.get<{ stamps: PostageBatch[] }>(stampsUrl)
      return postageResp.data.stamps
    } catch { }

    return [{
      batchID: this.emptyBatchId,
      batchTTL: -1,
      amount: "0",
      depth: 0,
      blockNumber: 0,
      bucketDepth: 0,
      exists: false,
      immutableFlag: false,
      label: "",
      usable: false,
      utilization: 0,
    }]
  }

  async getBatchId(): Promise<string> {
    if (this.userBatches) {
      const batch = this.userBatches.filter(batch => batch.usable)[0]
      if (batch) {
        return batch.id
      }
    }
    const batches = await this.getAllPostageBatch()
    const usableBatches = batches.filter(batch => batch.usable)
    return usableBatches[0]?.batchID || this.emptyBatchId
  }

  /**
   * Check if an hash is a valid swarm hash
   * 
   * @param hash Hash string
   * @returns True if the hash is valid
   */
  static isValidHash = (hash: string) => {
    return /^[0-9a-f]{64}$/.test(hash)
  }

}
