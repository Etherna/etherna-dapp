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

import { compose } from "redux"
import { providers } from "ethers/lib.esm/ethers"

import { ProfilePrefetch } from "prefetch/prefetchers/profilePrefetcher"
import { VideoPrefetch } from "prefetch/prefetchers/videoPrefetcher"

declare global {
  interface Window {
    // ethereum
    web3?: {
      currentProvider: providers.ExternalProvider
    }
    ethereum?: {
      autoRefreshOnNetworkChange: boolean
      chainId: number
      enable: () => Promise<string[]>
      networkVersion: string
      isMetamask?: boolean
      isFortmatic?: boolean
      isPortis?: boolean
      isWalletConnect?: boolean
      isSquarelink?: boolean
      isAuthereum?: boolean
    }

    // prefetch
    prefetchData?: ProfilePrefetch & VideoPrefetch

    // route state
    routeState?: any

    // redux
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose

    // atlassian
    ATL_JQ_PAGE_PROPS?: {
      triggerFunction?: (showCollectorDialog: () => void) => void
      showCollectorDialog?: () => void
    }

    // polyfills
    webkitRequestAnimationFrame?: typeof window.requestAnimationFrame
    mozRequestAnimationFrame?: typeof window.requestAnimationFrame
    msRequestAnimationFrame?: typeof window.requestAnimationFrame
  }

  interface Navigator {
    // polyfills
    msMaxTouchPoints?: typeof navigator.maxTouchPoints
  }
}
