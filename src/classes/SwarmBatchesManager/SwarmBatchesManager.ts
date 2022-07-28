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

import type { BatchId, PostageBatch } from "@ethersphere/bee-js"

import { getBatchSpace } from "@/utils/batches"
import type { AnyBatch, SwarmBatchesManagerOptions } from "./types"
import type SwarmBeeClient from "../SwarmBeeClient"
import type EthernaGatewayClient from "../EthernaGatewayClient"
import type { GatewayType } from "@/definitions/extension-host"

const DEFAULT_TTL = 60 * 60 * 24 * 365 * 2 // 2 years
const DEFAULT_SIZE = 2 ** 16 // 65kb - basic manifest

export default class SwarmBatchesManager {
  batches: AnyBatch[] = []

  onBatchesLoading?(): void
  onBatchesLoaded?(batches: AnyBatch[]): void
  onBatchCreating?(): void
  onBatchCreated?(batch: AnyBatch): void

  protected beeClient: SwarmBeeClient
  protected gatewayClient: EthernaGatewayClient
  protected gatewayType: GatewayType
  protected address: string

  constructor(opts: SwarmBatchesManagerOptions) {
    this.address = opts.address
    this.gatewayType = opts.gatewayType
    this.beeClient = opts.beeClient
    this.gatewayClient = opts.gatewayClient
  }

  async loadBatches(batchIds?: string[]): Promise<AnyBatch[]> {
    if (!batchIds || batchIds.length === 0) return []

    this.onBatchesLoading?.()

    const batches = await Promise.allSettled(
      batchIds.map(batchId => {
        if (this.gatewayType === "etherna-gateway") {
          return this.gatewayClient.users.fetchBatch(batchId)
        } else {
          return this.beeClient.getBatch(batchId)
        }
      })
    )

    this.batches = batches
      // @ts-ignore
      .filter<PromiseFulfilledResult<AnyBatch>>(batch => batch.status === "fulfilled")
      .map(batch => batch.value)
      .filter(batch => batch.usable)
      .filter(batch => "ownerAddress" in batch ? batch.ownerAddress === this.address : true)

    this.onBatchesLoaded?.(this.batches)

    return this.batches
  }

  getBatchForSize(size: number): AnyBatch | undefined {
    for (const batch of this.batches) {
      const { available } = getBatchSpace(batch)
      if (available >= size) {
        return batch
      }
    }
    return undefined
  }

  async getOrCreateBatchForSize(size: number, ttl = DEFAULT_TTL): Promise<AnyBatch> {
    let batch = this.getBatchForSize(size)
    if (!batch) {
      batch = await this.createBatchForSize(size, ttl)
    }
    return batch
  }

  async createBatchForSize(size: number, ttl = DEFAULT_TTL): Promise<AnyBatch> {
    const { depth, amount } = await this.calcDepthAmount(size, ttl)

    this.onBatchCreating?.()

    let batch: AnyBatch

    if (this.gatewayType === "etherna-gateway") {
      batch = await this.gatewayClient.users.createBatch(depth, amount)
    } else {
      batch = await this.beeClient.createBatch(depth, amount)
    }

    if (!batch) throw new Error("Could not create postage batch")

    this.batches.push(batch)

    this.onBatchCreated?.(batch)

    return batch
  }

  /**
   * Refresh a batch after utilization
   * @param batch The batch used
   */
  async refreshBatch(batch: AnyBatch) {
    const batchId = this.getBatchId(batch)
    const index = this.batches.findIndex(batch => this.getBatchId(batch) === batchId)

    if (index === -1) return

    let updatedBatch: AnyBatch
    if (this.gatewayType === "etherna-gateway") {
      updatedBatch = this.gatewayClient.users.fetchBatch(batchId)
    } else {
      updatedBatch = this.beeClient.getBatch(batchId)
    }

    this.batches[index] = updatedBatch
  }

  async calcDepthAmount(size = DEFAULT_SIZE, ttl = DEFAULT_TTL) {
    const price = await this.fetchPrice()
    const blockTime = 5
    const amount = Math.ceil(ttl * price / blockTime)
    let depth = 10

    while (size > (2 ** depth * 4096)) {
      depth += 1
    }

    return {
      amount,
      depth,
    }
  }

  calcBatchSizeForVideo(videoSizeInBytes: number, quality: number) {
    const encodeQualities = [360, 480, 720, 1080, 1440, 2160, 2880]

    if (quality > encodeQualities[encodeQualities.length - 1]) {
      encodeQualities.push(quality)
    }

    const closestQuality = encodeQualities.reduce((prev, curr) => {
      return Math.abs(curr - quality) < Math.abs(prev - quality) && curr >= quality ? curr : prev
    }, encodeQualities[0])
    const qualityIndex = encodeQualities.indexOf(closestQuality)
    const downscaledQualities = encodeQualities.slice(0, qualityIndex)
    const extraSpaceNeeded = downscaledQualities.reduce((prev, lowerQuality) => {
      return prev + (videoSizeInBytes * (lowerQuality / quality))
    }, 0)

    // thumbnails, manifest, captions...
    const marginBytes = 2 ** 20 * 100 // 100mb

    return extraSpaceNeeded + videoSizeInBytes + marginBytes
  }

  async fetchPrice() {
    try {
      if (this.gatewayType === "etherna-gateway") {
        return (await this.gatewayClient.system.fetchChainstate()).currentPrice
      } else {
        return await this.beeClient.getCurrentPrice()
      }
    } catch (error) {
      return 4 // hardcoded price
    }
  }

  parseBatch(batch: AnyBatch): PostageBatch {
    return {
      batchID: "id" in batch ? batch.id : batch.batchID,
      utilization: batch.utilization,
      usable: batch.usable,
      label: batch.label,
      depth: batch.depth,
      amount: batch.amount,
      bucketDepth: batch.bucketDepth,
      blockNumber: batch.blockNumber,
      immutableFlag: batch.immutableFlag,
      batchTTL: batch.batchTTL,
      exists: batch.exists,
    }
  }

  getBatchId(batch: AnyBatch): BatchId {
    return "id" in batch ? batch.id : batch.batchID
  }
}
