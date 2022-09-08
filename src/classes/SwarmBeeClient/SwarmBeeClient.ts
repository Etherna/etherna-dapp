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
import cookie from "cookiejs"

import type { AxiosUploadOptions, CustomUploadOptions } from "./bee-client.d.ts"
import type { GatewayBatch } from "@/definitions/api-gateway"
import { getBatchPercentUtilization } from "@/utils/batches"
import { buildAxiosFetch } from "@/utils/fetch"
import type { AxiosFetch } from "@/utils/fetch"
import http, { createRequest } from "@/utils/request"

export type MultipleFileUpload = { buffer: Uint8Array; type?: string }[]

const TOKEN_COOKIE_NAME = "bee-token"
const TOKEN_EXPIRATION_SETTING = "setting:token-expiration"

/**
 * Extend default Bee client with more functionalities
 */
export default class SwarmBeeClient extends Bee {
  public userBatches: GatewayBatch[]
  public emptyBatchId =
    "0000000000000000000000000000000000000000000000000000000000000000" as BatchId

  constructor(url: string, options?: BeeOptions & { userBatches?: GatewayBatch[] }) {
    const request = createRequest()
    request.defaults.withCredentials = true

    super(url, {
      ...options,
      fetch: buildAxiosFetch(request),
    })
    this.userBatches = options?.userBatches ?? []
  }

  public get isAuthenticated(): boolean {
    const token = this.authToken
    const tokenExpiration = localStorage.getItem(TOKEN_EXPIRATION_SETTING)
    const expirationDate = tokenExpiration ? new Date(+tokenExpiration) : new Date()

    return !!token && expirationDate > new Date()
  }

  public get authToken(): string | null {
    const token = cookie.get(TOKEN_COOKIE_NAME) as string | null
    return token
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
      data.map(data =>
        this.uploadFile(batchId, data.buffer, undefined, {
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
    const hash = reference.replace(/(^\/|\/$)/gi, "")
    const safePath = path?.replace(/(^\/|\/$)/gi, "")
    return `${this.url}/bzz/${hash}/${safePath ?? ""}`.replace(/\/?$/, "/")
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
        onDownloadProgress: p => {
          controller.abort()
        },
      })
      return true
    } catch {
      return false
    }
  }

  async authenticate(username: string, password: string): Promise<void> {
    let token = this.authToken
    const tokenExpiration = localStorage.getItem(TOKEN_EXPIRATION_SETTING)
    const expirationDate = tokenExpiration ? new Date(tokenExpiration) : new Date()

    if (token && expirationDate <= new Date()) {
      token = await this.refreshToken(token)
    }

    const expiry = 3600 * 24 // 1 day

    if (!token) {
      const credentials = btoa(`${username}:${password}`)

      const data = {
        role: "maintainer",
        expiry,
      }

      const resp = await http.post(`${this.url}/auth`, data, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      })

      token = resp.data.key
    }

    this.saveToken(token, expiry)
  }

  async refreshToken(token: string): Promise<string | null> {
    try {
      const resp = await http.post(`${this.url}/refresh`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const newToken = resp.data.key

      this.saveToken(newToken)

      return newToken
    } catch (error: any) {
      console.error(error.response)
      // cookie.remove(TOKEN_COOKIE_NAME)
      return null
    }
  }

  saveToken(token: string | null, expiry = 3600 * 24) {
    if (!token) {
      // cookie.remove(TOKEN_COOKIE_NAME)
      // localStorage.removeItem(TOKEN_EXPIRATION_SETTING)
    } else {
      const expiration = +new Date() + expiry * 1000

      const cookieExpiration = new Date()
      cookieExpiration.setFullYear(cookieExpiration.getFullYear() + 10)

      localStorage.setItem(TOKEN_EXPIRATION_SETTING, expiration.toString())
      cookie.set(TOKEN_COOKIE_NAME, token!, {
        sameSite: "Strict",
        expires: 3600 * 1000 * 87660,
        secure: true,
      })
    }
  }

  async getBatch(batchId: string): Promise<PostageBatch> {
    const token = this.authToken

    const resp = await http.get(`${this.url}/stamps/${batchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return resp.data
  }

  async getCurrentPrice(): Promise<number> {
    const token = this.authToken

    const resp = await http.get(`${this.url}/chainstate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return resp.data.currentPrice
  }

  async createBatch(depth = 20, amount: bigint | string = "10000000"): Promise<BatchId> {
    const token = this.authToken

    const resp = await http.post<{ batchID: BatchId }>(
      `${this.url}/stamps/${amount}/${depth}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const batchId = resp.data.batchID

    return batchId
  }

  /**
   * Topup batch (increase TTL)
   *
   * @param batchId Id of the swarm batch
   * @param byAmount Amount to add to the batch
   */
  async topupBatch(batchId: string, byAmount: number | string): Promise<boolean> {
    const token = this.authToken
    const stampsUrl = `${this.url}/stamps/topup/${batchId}/${byAmount}`

    await http.patch<{ batchID: BatchId }>(stampsUrl, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return true
  }

  /**
   * Dillute batch (increase size)
   *
   * @param batchId Id of the swarm batch
   * @param depth New depth of the batch
   */
  async diluteBatch(batchId: string, depth: number): Promise<boolean> {
    const token = this.authToken
    const stampsUrl = `${this.url}/stamps/dilute/${batchId}/${depth}`

    await http.patch<{ batchID: BatchId }>(stampsUrl, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return true
  }

  async getAllPostageBatches(): Promise<PostageBatch[]> {
    const token = this.authToken
    const stampsUrl = this.url + "/stamps"

    const postageResp = await http.get<{ stamps: PostageBatch[] }>(stampsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return postageResp.data.stamps
  }

  async getBatchId(): Promise<string> {
    const usableBatch = (batch: GatewayBatch | PostageBatch) =>
      batch.usable && getBatchPercentUtilization(batch) < 1

    if (this.userBatches) {
      const batch = this.userBatches.filter(usableBatch)[0]
      if (batch) {
        return batch.id
      }
    }
    const batches = await this.getAllPostageBatches()
    const usableBatches = batches.filter(usableBatch)
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
