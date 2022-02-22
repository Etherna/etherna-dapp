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

export type GatewayClientOptions = {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export type GatewayCurrentUser = {
  etherAddress: string
  etherPreviousAddresses: string[]
  username: string
}

export type GatewayCredit = {
  isUnlimited: boolean
  balance: number
}

export type GatewayBatchPreview = {
  batchId: string
  ownerNodeId: string
}

export type GatewayBatch = {
  id: string
  amountPaid: number
  batchTTL: number
  blockNumber: number
  bucketDepth: number
  depth: number
  exists: boolean
  immutableFlag: boolean
  label: string
  normalisedBalance: number
  ownerAddress: string
  usable: boolean
  utilization: number
}
