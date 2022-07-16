import type { PostageBatch } from "@ethersphere/bee-js"

import dayjs from "@/utils/dayjs"

/**
 * Get postage batch space utilization (in bytes)
 * 
 * @param batch Batch data
 * @returns An object with total, used and available space
 */
export const getBatchSpace = (batch: PostageBatch) => {
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
 * Get the batch expiration day
 * 
 * @param batch Batch data
 * @returns Expiration dayjs object
 */
export const getBatchExpiration = (batch: PostageBatch) => {
  return dayjs().add(batch.batchTTL, "seconds")
}
