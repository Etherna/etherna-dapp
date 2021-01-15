import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { getNetworkName } from "@utils/ethFuncs"
import { UIActionTypes } from "@state/reducers/uiReducer"
import Web3 from "web3"

export const checkMobileWeb3 = () => {
  const mobilePattern = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  let isMobile = mobilePattern.test(navigator.userAgent)

  store.dispatch({
    type: EnvActionTypes.ENV_SET_IS_MOBILE,
    isMobile,
  })
}

export const checkNetwork = async () => {
  const { web3 } = store.getState().env
  const { isSignedIn } = store.getState().user
  const network = await getNetwork(web3)
  const currentNetwork = network
  const prevNetwork = window.localStorage.getItem("currentNetwork") || ""
  const shouldShowSwitchNetwork = window.localStorage.getItem("shouldShowSwitchNetwork")

  window.localStorage.setItem("prevNetwork", prevNetwork)
  window.localStorage.setItem("currentNetwork", currentNetwork || "")

  if (prevNetwork !== currentNetwork) {
    store.dispatch({
      type: EnvActionTypes.ENV_UPDATE_NETWORK,
      network: currentNetwork,
    })
  }

  if (
    prevNetwork &&
    prevNetwork !== currentNetwork &&
    isSignedIn &&
    shouldShowSwitchNetwork === "true"
  ) {
    window.localStorage.setItem("shouldShowSwitchNetwork", "false")
    store.dispatch({
      type: UIActionTypes.UI_TOGGLE_NETWORK_CHANGE,
      showNetwokChangeModal: true,
    })
    store.dispatch({
      type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
      isLoadingProfile: false,
    })
  } else {
    window.localStorage.setItem("shouldShowSwitchNetwork", "true")
  }
}

const getNetwork = async (web3?: Web3) => {
  if (!web3) return null

  let network: number|undefined
  const hasGetNetwork = typeof (web3.version as any).getNetwork !== "undefined"
  const hasGetId = web3.eth.net && !!web3.eth.net.getId
  const hasGetNetworkType = web3.eth.net && !!web3.eth.net.getNetworkType

  try {
    if (hasGetNetwork) {
      network = await (web3.version as any).getNetwork() as number
    } else if (hasGetId) {
      network = await web3.eth.net.getId()
    } else if (hasGetNetworkType) {
      return await web3.eth.net.getNetworkType()
    }
  } catch (error) {
    console.error("error", error)
  }

  return getNetworkName(network)
}
