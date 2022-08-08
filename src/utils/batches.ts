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
import type { Dayjs } from "dayjs"

import dayjs from "@/utils/dayjs"
import type { GatewayBatch } from "@/definitions/api-gateway"

/**
 * Get postage batch space utilization (in bytes)
 * 
 * @param batch Batch data
 * @returns An object with total, used and available space
 */
export const getBatchSpace = (batch: PostageBatch | GatewayBatch) => {
  const { utilization, depth, bucketDepth } = batch

  const usage = utilization / 2 ** (depth - bucketDepth)
  const total = 2 ** depth * 4096
  const used = total * usage
  const available = total - used

  return {
    total,
    used,
    available,
  }
}

/**
 * Get batch capacity
 * 
 * @param batchOrDepth Batch data or depth
 * @returns Batch total capcity in bytes
 */
export const getBatchCapacity = (batchOrDepth: PostageBatch | GatewayBatch | number) => {
  const depth = typeof batchOrDepth === "number" ? batchOrDepth : batchOrDepth.depth
  return 2 ** depth * 4096
}

/**
 * Get the batch expiration day
 * 
 * @param batch Batch data
 * @returns Expiration dayjs object
 */
export const getBatchExpiration = (batch: PostageBatch | GatewayBatch): Dayjs => {
  if (batch.batchTTL === -1) {
    return dayjs(Infinity)
  }
  return dayjs().add(batch.batchTTL, "seconds")
}

/**
 * Prase a default postage batch to a gateway batch
 * 
 * @param batch Postage batch
 * @returns Gateway batch
 */
export const parsePostageBatch = (batch: PostageBatch, owner: string | null | undefined): GatewayBatch => {
  return {
    id: batch.batchID,
    amountPaid: 0,
    normalisedBalance: 0,
    ownerAddress: owner ?? null,
    amount: batch.amount,
    batchTTL: batch.batchTTL,
    blockNumber: batch.blockNumber,
    bucketDepth: batch.bucketDepth,
    depth: batch.depth,
    exists: batch.exists,
    immutableFlag: batch.immutableFlag,
    label: batch.label,
    usable: batch.usable,
    utilization: batch.utilization,
  }
}

/**
 * Convert TTL to batch amount
 * 
 * @param ttl TTL in seconds
 * @param price Token price
 * @param blockTime Chain blocktime
 * @returns Batch amount
 */
export const ttlToAmount = (ttl: number, price: number, blockTime: number): bigint => {
  return BigInt(ttl) * BigInt(price) / BigInt(blockTime)
}

/**
 * Calc batch price from depth & amount
 * 
 * @param depth Batch depth
 * @param amount Batch amount
 * @returns Price in BZZ
 */
export const getPrice = (depth: number, amount: bigint | string): string => {
  const hasInvalidInput = BigInt(amount) <= BigInt(0) || isNaN(depth) || depth < 17 || depth > 255

  if (hasInvalidInput) {
    return "-"
  }

  const price = BigInt(amount) * BigInt(2 ** depth)
  const readablePrice = price / BigInt(10 ** 16) // 16 is token decimal places

  return `${readablePrice} xBZZ`
}

export const calcDilutedTTL = (currentTTL: number, currentDepth: number, newDepth: number): number => {
  return Math.ceil(currentTTL / (2 ** (newDepth - currentDepth)))
}
