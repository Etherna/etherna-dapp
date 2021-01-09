import Web3 from "web3"

import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { WindowWeb3 } from "typings/window"

const injectWeb3 = () => {
  const windowWeb3 = window as WindowWeb3
  const web3 =
    windowWeb3.web3 && windowWeb3.web3.currentProvider
      ? new Web3(windowWeb3.web3.currentProvider)
      : new Web3(`wss://mainnet.infura.io/ws/v3/${process.env.REACT_APP_INFURA_ID}`)

  if (windowWeb3.ethereum) {
    windowWeb3.ethereum.autoRefreshOnNetworkChange = false
  }

  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_PROVIDER,
    web3,
    currentWallet: undefined,
    currentWalletLogo: undefined,
  })
}

export default injectWeb3
