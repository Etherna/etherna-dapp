import Web3 from "web3"

import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

const injectWeb3 = () => {
  const web3 = window.web3?.currentProvider
    ? new Web3(window.web3.currentProvider)
    : new Web3(`wss://mainnet.infura.io/ws/v3/${process.env.REACT_APP_INFURA_ID}`)

  if (window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false
  }

  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_PROVIDER,
    web3,
    currentWallet: undefined,
    currentWalletLogo: undefined,
  })
}

export default injectWeb3
