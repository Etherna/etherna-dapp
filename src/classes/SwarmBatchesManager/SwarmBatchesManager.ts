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
import type SwarmBeeClient from "@/classes/SwarmBeeClient"
import type EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import type { GatewayType } from "@/definitions/extension-host"

const DEFAULT_TTL = 60 * 60 * 24 * 365 * 2 // 2 years
const DEFAULT_SIZE = 2 ** 16 // 65kb - basic manifest

export default class SwarmBatchesManager {
  batches: AnyBatch[] = []

  onBatchesLoading?(): void
  onBatchesLoaded?(batches: AnyBatch[]): void
  onBatchCreating?(): void
  onBatchCreated?(batch: AnyBatch): void
  onBatchUpdating?(batch: AnyBatch): void
  onBatchUpdated?(batch: AnyBatch): void

  protected beeClient: SwarmBeeClient
  protected gatewayClient: EthernaGatewayClient
  protected gatewayType: GatewayType
  protected address: string

  private cachedPrice?: number
  private defaultBlockTime = import.meta.env.DEV ? 15 : 5.2 // goerli testnet vs gnosis
  private updateQueueCount = 0

  constructor(opts: SwarmBatchesManagerOptions) {
    this.address = opts.address
    this.gatewayType = opts.gatewayType
    this.beeClient = opts.beeClient
    this.gatewayClient = opts.gatewayClient
  }

  /**
   * Load all batches
   * 
   * @param batchIds Id of the batches
   * @returns Loaded batches
   */
  async loadBatches(batchIds?: BatchId[]): Promise<AnyBatch[]> {
    if (!batchIds || batchIds.length === 0) return []

    this.onBatchesLoading?.()

    const batches = await Promise.allSettled(
      batchIds.map(id => this.fetchBatch(id, true))
    )

    this.batches = batches
      // @ts-ignore
      .filter<PromiseFulfilledResult<AnyBatch>>(batch => batch.status === "fulfilled")
      .map(batch => batch.value)
      .filter(batch => "ownerAddress" in batch ? batch.ownerAddress === this.address : true)

    this.onBatchesLoaded?.(this.batches)

    return this.batches
  }

  /**
   * Fetch a batch from given id
   * 
   * @param batchId Id of the batch to fetch
   * @param waitPropagation Wait for the batch to be propagated
   * @returns The batch (can throw if not found)
   */
  async fetchBatch(batchId: BatchId, waitPropagation = false): Promise<AnyBatch> {
    let batch: AnyBatch
    if (this.gatewayType === "etherna-gateway") {
      batch = await this.gatewayClient.users.fetchBatch(batchId)
    } else {
      batch = await this.beeClient.getBatch(batchId)
    }

    const isCreating = !batch.usable && (+batch.amount === 0 || batch.depth === 0)

    if (isCreating && waitPropagation) {
      await this.waitBatchPropagation(batch)
    }

    return batch
  }

  /**
   * Topup a batch (increase TTL)
   * 
   * @param batchId Batch to topup
   * @param byAmount Amount to topup
   */
  async topupBatch(batchId: BatchId, byAmount: number): Promise<void> {
    let batch = this.findBatchById(batchId)
    if (batch) {
      this.updateQueueCount++
      this.onBatchUpdating?.(batch)
    }

    if (this.gatewayType === "etherna-gateway") {
      await this.gatewayClient.postage.topupBatch(batchId, byAmount)
    } else {
      await this.beeClient.topupBatch(batchId, byAmount)
    }
  }

  /**
   * Dilute batch (increase depth)
   * 
   * @param batchId Id of the batch to dilute
   * @param depth New depth
   */
  async diluteBatch(batchId: BatchId, depth: number): Promise<void> {
    let batch = this.findBatchById(batchId)
    if (batch) {
      this.updateQueueCount++
      this.onBatchUpdating?.(batch)
    }

    if (this.gatewayType === "etherna-gateway") {
      await this.gatewayClient.users.diluteBatch(batchId, depth)
    } else {
      await this.beeClient.diluteBatch(batchId, depth)
    }
  }

  /**
   * Find the right batch for the given size
   * 
   * @param size Size needed for the uploads
   * @returns The batch or `undefined` if not found
   */
  getBatchForSize(size: number): AnyBatch | undefined {
    for (const batch of this.batches) {
      const { available } = getBatchSpace(batch)
      if (available >= size) {
        return batch
      }
    }
    return undefined
  }

  /**
   * Find a batch from an id (in memory)
   * 
   * @param batchId Batch id to search for
   * @returns The batch or undefined if not found
   */
  findBatchById(batchId: BatchId): AnyBatch | undefined {
    return this.batches.find(batch => this.getBatchId(batch) === batchId)
  }

  /**
   * Get an existing batch or create a new one based on size
   * 
   * @param size Size needed for the uploads
   * @param ttl Expiration in seconds (for creation, default is 2 years)
   * @returns The batch
   */
  async getOrCreateBatchForSize(size: number, ttl = DEFAULT_TTL): Promise<AnyBatch> {
    let batch = this.getBatchForSize(size)
    if (!batch) {
      batch = await this.createBatchForSize(size, ttl)
    }
    return batch
  }

  /**
   * Create new batch based on size and ttl
   * 
   * @param size Batch min size
   * @param ttl Batch expiration in seconds
   * @returns The created batch
   */
  async createBatchForSize(size: number, ttl = DEFAULT_TTL): Promise<AnyBatch> {
    const { depth, amount } = await this.calcDepthAmount(size, ttl)

    this.onBatchCreating?.()

    let batch: AnyBatch

    if (this.gatewayType === "etherna-gateway") {
      batch = await this.gatewayClient.users.createBatch(depth, amount)
    } else {
      const batchId = await this.beeClient.createBatch(depth, amount)
      batch = await this.fetchBatch(batchId)
    }

    if (!batch) throw new Error("Could not create postage batch")

    this.batches.push(batch)

    return batch
  }

  /**
   * Auto-increase batch size and re-balance TTL
   * 
   * @param batch Batch to extend
   * @param addSize Size to add to the batch
   */
  async increaseBatchSize(batch: AnyBatch, addSize: number) {
    const batchId = this.getBatchId(batch)

    const newSize = getBatchSpace(batch).total + addSize

    let depth = batch.depth + 1
    while (newSize > (2 ** depth * 4096)) {
      depth += 1
    }

    await this.diluteBatch(batchId, depth)

    await this.waitBatchPropagation(batch)

    const newTTL = Math.ceil(batch.batchTTL / (2 ** (depth - batch.depth)))

    // topup batch
    const price = await this.fetchPrice()
    const ttl = Math.abs(batch.batchTTL - newTTL)
    const byAmount = Math.ceil(ttl * price / this.defaultBlockTime)
    await this.topupBatch(batchId, byAmount)

    return true
  }

  /**
   * Increase a batch expiration time
   * 
   * @param batch Batch to extend
   * @param addTTL Seconds to add to batch
   */
  async increaseBatchTTL(batch: AnyBatch, addTTL: number) {
    const price = await this.fetchPrice()
    const ttl = batch.batchTTL + addTTL
    const byAmount = Math.ceil(ttl * price / 15)

    await this.topupBatch(this.getBatchId(batch), byAmount)

    return true
  }

  async waitBatchPropagation(batch: AnyBatch, interval = 5000) {
    let topupPromiseResolve: ((batch: AnyBatch) => void) | undefined

    const waitPropagation = () => {
      setTimeout(async () => {
        const fetchedBatch = await this.fetchBatch(this.getBatchId(batch))

        // creation
        const hasCreated = batch.depth === 0 && fetchedBatch.depth > 0
        // dilute
        const increasedDepth = fetchedBatch.depth > batch.depth
        // topup
        const increasedAmount = fetchedBatch.amount > batch.amount

        if (hasCreated || increasedDepth || increasedAmount) {
          const index = this.batches.findIndex(b => this.getBatchId(b) === this.getBatchId(fetchedBatch))
          this.batches[index] = fetchedBatch

          if (hasCreated) {
            this.onBatchCreated?.(fetchedBatch)
          } else {
            this.updateQueueCount--
            this.updateQueueCount === 0 && this.onBatchUpdated?.(fetchedBatch)
          }

          topupPromiseResolve?.(fetchedBatch)
        } else {
          waitPropagation()
        }
      }, interval)
    }

    return new Promise<AnyBatch>(res => {
      topupPromiseResolve = res
      waitPropagation()
    })
  }

  canUploadTo(batch: AnyBatch, size: number): boolean {
    const { available } = getBatchSpace(batch)
    return available >= size
  }

  /**
   * Refresh a batch after utilization
   * 
   * @param batch The batch used
   */
  async refreshBatch(batch: AnyBatch) {
    const batchId = this.getBatchId(batch)
    const index = this.batches.findIndex(batch => this.getBatchId(batch) === batchId)

    if (index === -1) return

    let updatedBatch: AnyBatch
    if (this.gatewayType === "etherna-gateway") {
      updatedBatch = await this.gatewayClient.users.fetchBatch(batchId)
    } else {
      updatedBatch = await this.beeClient.getBatch(batchId)
    }

    this.batches[index] = updatedBatch
  }

  async calcDepthAmount(size = DEFAULT_SIZE, ttl = DEFAULT_TTL) {
    const price = await this.fetchPrice()
    const amount = Math.ceil(ttl * price / this.defaultBlockTime)
    let depth = 17 // min depth

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

  async fetchPrice(): Promise<number> {
    if (this.cachedPrice) return this.cachedPrice

    try {
      if (this.gatewayType === "etherna-gateway") {
        this.cachedPrice = (await this.gatewayClient.system.fetchChainstate()).currentPrice
      } else {
        this.cachedPrice = await this.beeClient.getCurrentPrice()
      }
    } catch (error) {
      this.cachedPrice = 4 // hardcoded price
    }

    return this.cachedPrice
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
