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

import type { PostageBatch } from "@ethersphere/bee-js"

import type { SwarmBatchesManagerOptions } from "./types"
import type SwarmBeeClient from "../SwarmBeeClient"
import type EthernaGatewayClient from "../EthernaGatewayClient"
import type { GatewayBatch } from "@/definitions/api-gateway"
import { getBatchSpace } from "@/utils/batches"

const DEFAULT_TTL = 60 * 60 * 24 * 365 * 2 // 2 years
const DEFAULT_SIZE = 2 ** 16 // 65kb - basic manifest

type AnyBatch = PostageBatch | GatewayBatch

export default class SwarmBatchesManager {
  batches: AnyBatch[] = []

  onBatchesLoading?(): void
  onBatchesLoaded?(batches: AnyBatch[]): void
  onBatchCreating?(): void
  onBatchCreated?(batch: AnyBatch): void

  protected beeClient: SwarmBeeClient
  protected gatewayClient: EthernaGatewayClient
  protected address: string

  constructor(opts: SwarmBatchesManagerOptions) {
    this.address = opts.address
    this.beeClient = opts.beeClient
    this.gatewayClient = opts.gatewayClient
  }

  async loadBatches(batchIds: string[]) {
    this.onBatchesLoading?.()

    const batches = await Promise.allSettled(
      batchIds.map(batchId => {
        if (this.gatewayClient) {
          return this.gatewayClient.users.fetchBatch(batchId)
        } else {
          return this.beeClient!.getBatch(batchId)
        }
      })
    )

    this.batches = batches
      // @ts-ignore
      .filter<PromiseFulfilledResult<PostageBatch | GatewayBatch>>(batch => batch.status === "fulfilled")
      .map(batch => batch.value)
      .filter(batch => batch.usable)
      .filter(batch => "ownerAddress" in batch ? batch.ownerAddress === this.address : true)

    this.onBatchesLoaded?.(this.batches)

    return this.batches
  }

  getBatchForSize(size: number): PostageBatch | GatewayBatch | undefined {
    for (const batch of this.batches) {
      const { available } = getBatchSpace(batch)
      if (available >= size) {
        return batch
      }
    }
    return undefined
  }

  async createBatchForSize(size: number, ttl = DEFAULT_TTL): Promise<PostageBatch | GatewayBatch> {
    const { depth, amount } = await this.calcDepthAmount(size, ttl)

    this.onBatchCreating?.()

    let batch: AnyBatch

    if (this.gatewayClient) {
      batch = await this.gatewayClient.users.createBatch(depth, amount)
    } else {
      batch = await this.beeClient!.createBatch(size)
    }

    this.onBatchCreated?.(batch)

    return batch
  }

  async calcDepthAmount(size = DEFAULT_SIZE, ttl = DEFAULT_TTL) {
    const price = await this.fetchPrice()
    const blockTime = 5
    const amount = ttl * price / blockTime
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
    return extraSpaceNeeded + videoSizeInBytes
  }

  async fetchPrice() {
    try {
      if (this.gatewayClient) {
        return (await this.gatewayClient.system.fetchChainstate()).currentPrice
      } else {
        return await this.beeClient!.getCurrentPrice()
      }
    } catch (error) {
      return 4 // hardcoded price
    }
  }
}
