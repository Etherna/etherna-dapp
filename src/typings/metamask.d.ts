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

type ExternalProvider = {
  _state?: {
    accounts: string[] | null
    initialized: boolean
    isConnected: boolean
    isPermanentlyDisconnected: boolean
    isUnlocked: boolean
  }
  isMetaMask?: boolean
  autoRefreshOnNetworkChange?: boolean
  chainId?: string
  networkVersion?: string
  selectedAddress?: string
  on?(event: "accountsChanged", callback: (accounts: string[]) => void): void
  on?(event: "chainChanged", callback: (chainId: string) => void): void
  on?(event: "connect", callback: (connectInfo: any) => void): void
  on?(event: "disconnect", callback: (error: ProviderRpcError) => void): void
  removeListener?(event: string, callback: Function): void
  isConnected?(): Promise<boolean>
  enable?(): Promise<string[]>
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void
  send?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>
}

interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}
