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

import { providers } from "ethers/lib.esm/ethers"

/**
 * Check if a string a valid eth address
 * @param address Address string value
 */
export const checkIsEthAddress = (address: string | null | undefined) => {
  const isEthereumAddress = /^(0x)?[0-9a-f]{40}$/i.test(address || "")
  return isEthereumAddress
}

/**
 * Get the shorten string of a address
 * @param address Address string value
 */
export const shortenEthAddr = (address: string | null | undefined) => {
  if (!address) return ""
  if (address.length <= 5) return address
  return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`
}

/**
 * Check if a provider is injected by the browser
 * @param provider Web3 provider
 */
export const checkUsingInjectedProvider = (provider: any) => {
  const { isFortmatic, isPortis, isWalletConnect, isSquarelink, isAuthereum } = provider

  if (isFortmatic || isPortis || isWalletConnect || isSquarelink || isAuthereum) return false
  return true
}

/**
 * Fetch the wallet accounts
 * @param web3 Web3 instance
 */
export const fetchAccounts = async (provider?: providers.Web3Provider) => {
  if (!provider && !window.web3?.currentProvider) return []

  const web3Provider = provider ?? new providers.Web3Provider(window.web3!.currentProvider)
  return await web3Provider.listAccounts()
}

/**
 * Get the network name from the id
 * @param networkId Id of the networks
 */
export const getNetworkName = (networkId: number | string | undefined) => {
  if (!networkId) return ""

  switch (+networkId) {
    case 1:
      return "Main"
    case 2:
      return "Morder"
    case 3:
      return "Ropsten"
    case 4:
      return "Rinkeby"
    case 42:
      return "Kovan"
    default:
      return "Unknown"
  }
}
