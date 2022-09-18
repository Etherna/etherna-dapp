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

import type { BatchId, PostageBatch } from "../BeeClient/types"
import type { AnyBatch, SwarmBatchesManagerOptions } from "./types"
import type BeeClient from "@/classes/BeeClient"
import type EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import FlagEnumManager from "@/classes/FlagEnumManager"
import type { GatewayType } from "@/definitions/extension-host"
import batchesStore, { BatchUpdateType } from "@/stores/batches"
import type { UpdatingBatch } from "@/stores/batches"
import { calcDilutedTTL, getBatchCapacity, getBatchSpace, ttlToAmount } from "@/utils/batches"

const DEFAULT_TTL = 60 * 60 * 24 * 365 * 2 // 2 years
const DEFAULT_SIZE = 2 ** 16 // 65kb - basic manifest

const MIN_BATCH_DEPTH = 20
const MAX_BATCH_DEPTH = 30
const MAX_ETHERNA_BATCH_DEPTH = 20

let lastPriceFetched: { url: string; price: number } | undefined

export default class SwarmBatchesManager {
  batches: AnyBatch[] = []

  onBatchesLoading?(): void
  onBatchesLoaded?(batches: AnyBatch[]): void
  onBatchLoadError?(batchId: BatchId, error: any): void
  onBatchCreating?(): void
  onBatchCreated?(batch: AnyBatch): void
  onBatchUpdating?(batchId: BatchId): void
  onBatchUpdated?(batch: AnyBatch): void

  protected beeClient: BeeClient
  protected gatewayClient: EthernaGatewayClient
  protected gatewayType: GatewayType
  protected address: string

  public defaultBlockTime = import.meta.env.DEV ? 15 : 5 // goerli testnet vs gnosis

  constructor(opts: SwarmBatchesManagerOptions) {
    this.address = opts.address
    this.gatewayType = opts.gatewayType
    this.beeClient = opts.beeClient
    this.gatewayClient = opts.gatewayClient

    batchesStore.getState().updatingBatches.forEach(batchUpdate => {
      const flag = new FlagEnumManager(batchUpdate.flag)
      if (flag.has(BatchUpdateType.Create)) {
        this.onBatchCreating?.()
      }
      if (flag.has(BatchUpdateType.Dilute) || flag.has(BatchUpdateType.Topup)) {
        this.onBatchUpdating?.(batchUpdate.id)
      }
    })
  }

  public get cachedPrice() {
    return lastPriceFetched
  }

  private set cachedPrice(val: { url: string; price: number } | undefined) {
    lastPriceFetched = val
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

    const batches = await Promise.allSettled(batchIds.map(id => this.fetchBatch(id, true)))

    this.batches = batches
      // @ts-ignore
      .filter<PromiseFulfilledResult<AnyBatch>>(batch => batch.status === "fulfilled")
      .map(batch => batch.value)

    this.onBatchesLoaded?.(this.batches)

    batches
      // @ts-ignore
      .filter<PromiseRejectedResult>(batch => batch.status === "rejected")
      .forEach((result, i) => {
        this.onBatchLoadError?.(batchIds[i], result.reason)
      })

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
      batch = await this.beeClient.stamps.download(batchId)
    }

    const isCreating = !batch.usable

    if (isCreating && waitPropagation) {
      batch = await this.waitBatchPropagation(batch, BatchUpdateType.Create)
    }

    return batch
  }

  /**
   * Topup a batch (increase TTL)
   *
   * @param batchId Batch to topup
   * @param byAmount Amount to topup
   */
  async topupBatch(batchId: BatchId, byAmount: number | string): Promise<void> {
    let batch = this.findBatchById(batchId)
    if (batch) {
      this.onBatchUpdating?.(this.getBatchId(batch))
    }

    if (this.gatewayType === "etherna-gateway") {
      await this.gatewayClient.postage.topupBatch(batchId, byAmount)
    } else {
      await this.beeClient.stamps.topup(batchId, byAmount.toString())
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
      this.onBatchUpdating?.(this.getBatchId(batch))
    }

    if (this.gatewayType === "etherna-gateway") {
      await this.gatewayClient.users.diluteBatch(batchId, depth)
    } else {
      await this.beeClient.stamps.dilute(batchId, depth)
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
      const batchId = await this.beeClient.stamps.create(depth, amount)
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
    while (newSize > getBatchCapacity(batch)) {
      depth += 1
    }

    await this.diluteBatch(batchId, depth)

    // bee returns error until dilute has finished
    await this.waitBatchPropagation(batch, BatchUpdateType.Dilute)

    const newTTL = calcDilutedTTL(batch.batchTTL, batch.depth, depth)

    // topup batch
    const price = await this.fetchPrice()
    const ttl = Math.abs(batch.batchTTL - newTTL)
    const byAmount = ttlToAmount(ttl, price, this.defaultBlockTime).toString()
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
    const byAmount = ttlToAmount(ttl, price, this.defaultBlockTime).toString()

    await this.topupBatch(this.getBatchId(batch), byAmount)

    return true
  }

  async waitBatchPropagation(
    batch: AnyBatch | UpdatingBatch,
    updateType: BatchUpdateType,
    interval = 5000
  ) {
    let propagationPromiseResolve: ((batch: AnyBatch) => void) | undefined

    const flag = new FlagEnumManager(updateType)

    batchesStore.getState().addBatchUpdate(batch, updateType)

    const waitPropagation = () => {
      setTimeout(async () => {
        const fetchedBatch = await this.fetchBatch(this.getBatchId(batch))

        // creation
        const hasCreated = fetchedBatch.depth > 0
        // dilute
        const increasedDepth = fetchedBatch.depth > batch.depth
        // topup
        const increasedAmount = fetchedBatch.amount > batch.amount

        const canFinish =
          (!flag.has(BatchUpdateType.Create) || (flag.has(BatchUpdateType.Create) && hasCreated)) &&
          (!flag.has(BatchUpdateType.Dilute) ||
            (flag.has(BatchUpdateType.Dilute) && increasedDepth)) &&
          (!flag.has(BatchUpdateType.Topup) || (flag.has(BatchUpdateType.Topup) && increasedAmount))

        if (canFinish) {
          const index = this.batches.findIndex(
            b => this.getBatchId(b) === this.getBatchId(fetchedBatch)
          )
          this.batches[index] = fetchedBatch

          batchesStore.getState().removeBatchUpdate(this.getBatchId(fetchedBatch))

          if (hasCreated) {
            this.onBatchCreated?.(fetchedBatch)
          } else {
            this.onBatchUpdated?.(fetchedBatch)
          }

          propagationPromiseResolve?.(fetchedBatch)
        } else {
          waitPropagation()
        }
      }, interval)
    }

    return new Promise<AnyBatch>(res => {
      propagationPromiseResolve = res
      waitPropagation()
    })
  }

  isCreatingBatch(batch: AnyBatch | UpdatingBatch) {
    const isCreating =
      batchesStore
        .getState()
        .updatingBatches.findIndex(
          b =>
            b.id === this.getBatchId(batch) &&
            new FlagEnumManager(b.flag).has(BatchUpdateType.Create)
        ) >= 0

    return isCreating
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
      updatedBatch = await this.beeClient.stamps.download(batchId)
    }

    this.batches[index] = updatedBatch
  }

  async calcDepthAmount(size = DEFAULT_SIZE, ttl = DEFAULT_TTL) {
    const price = await this.fetchPrice()
    const amount = ttlToAmount(ttl, price, this.defaultBlockTime).toString()
    let depth = MIN_BATCH_DEPTH
    const maxDepth =
      this.gatewayType === "etherna-gateway" ? MAX_ETHERNA_BATCH_DEPTH : MAX_BATCH_DEPTH

    while (size > getBatchCapacity(depth) && depth < maxDepth) {
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
      return prev + videoSizeInBytes * (lowerQuality / quality)
    }, 0)

    // thumbnails, manifest, captions...
    const marginBytes = 2 ** 20 * 100 // 100mb

    return extraSpaceNeeded + videoSizeInBytes + marginBytes
  }

  async fetchPrice(): Promise<number> {
    const url = this.gatewayType === "etherna-gateway" ? this.gatewayClient.url : this.beeClient.url
    if (this.cachedPrice && this.cachedPrice.url === url) return this.cachedPrice.price

    try {
      if (this.gatewayType === "etherna-gateway") {
        this.cachedPrice = {
          url,
          price: (await this.gatewayClient.system.fetchChainstate()).currentPrice,
        }
      } else {
        this.cachedPrice = {
          url,
          price: await this.beeClient.chainstate.getCurrentPrice(),
        }
      }
    } catch (error) {
      this.cachedPrice = {
        url,
        price: 4, // hardcoded price
      }
    }

    return this.cachedPrice.price
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

  getBatchId(batch: { id: BatchId } | { batchID: BatchId }): BatchId {
    return "id" in batch ? batch.id : batch.batchID
  }
}
