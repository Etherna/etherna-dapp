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
      showCollectorDialog?: () => void
    }
  }
}
