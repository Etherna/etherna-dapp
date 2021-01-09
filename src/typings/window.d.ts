import { compose } from "redux"
import Web3 from "web3"

export type WindowWeb3 = Window & {
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
}

export type WindowReduxDev = Window & {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
}
