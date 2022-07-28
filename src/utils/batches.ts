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
