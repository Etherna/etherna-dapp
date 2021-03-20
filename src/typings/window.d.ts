import Web3 from "web3"
import { compose } from "redux"

import { ProfilePrefetch } from "prefetch/prefetchers/profilePrefetcher"
import { VideoPrefetch } from "prefetch/prefetchers/videoPrefetcher"

declare global {
  interface Window {
    // web3
    web3?: Web3
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

    // redux
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose

    // atlassian
    ATL_JQ_PAGE_PROPS?: {
      showCollectorDialog?: () => void
    }
  }
}
