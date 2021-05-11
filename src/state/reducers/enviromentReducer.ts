import Web3 from "web3"

import { baseKeymap } from "@keyboard"
import { Keymap, KeymapNamespace } from "@keyboard/typings"
import lang from "@lang"
import EthernaGatewayClient from "@classes/EthernaGatewayClient"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import EthernaAuthClient from "@classes/EthernaAuthClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { loadDarkMode } from "@state/actions/enviroment/darkMode"
import { EnvState } from "@state/types"
import { checkIsMobile } from "@utils/browser"

export const EnvActionTypes = {
  ENV_UPDATE_PROVIDER: "ENV_UPDATE_PROVIDER",
  ENV_UPDATE_NETWORK: "ENV_UPDATE_NETWORK",
  ENV_SET_CURRENT_ADDRESS: "ENV_SET_CURRENT_ADDRESS",
  ENV_SET_IS_MOBILE: "ENV_SET_IS_MOBILE",
  ENV_UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
  ENV_UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
  ENV_UPDATE_BEE_CLIENT: "ENV_UPDATE_BEE_CLIENT",
  ENV_UPDATE_KEYMAP: "ENV_UPDATE_KEYMAP",
  ENV_EDIT_SHORTCUT: "ENV_EDIT_SHORTCUT",
  ENV_TOGGLE_DARK_MODE: "ENV_TOGGLE_DARK_MODE",
  ENV_UPDATE_BYTE_PRICE: "ENV_UPDATE_BYTE_PRICE",
} as const

// Export dispatch actions
type UpdateProviderAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_PROVIDER
  web3?: Web3
  currentWallet?: string
  currentWalletLogo?: string
}
type UpdateNetworkAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_NETWORK
  network?: string | null
}
type SetCurrentAddressAction = {
  type: typeof EnvActionTypes.ENV_SET_CURRENT_ADDRESS
  currentAddress?: string
  previusAddress?: string
}
type SetIsMobileAction = {
  type: typeof EnvActionTypes.ENV_SET_IS_MOBILE
  isMobile: boolean
}
type UpdateIndexHostAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_INDEXHOST
  indexHost: string
  apiPath: string | null | undefined
  indexClient: EthernaIndexClient
}
type UpdateGatewayHostAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_GATEWAY_HOST
  gatewayHost: string
  apiPath: string | null | undefined
  beeClient: SwarmBeeClient
}
type UpdateBeeClientAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_BEE_CLIENT
  beeClient: SwarmBeeClient
}
type UpdateKeymapAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_KEYMAP
  keymap: Keymap
}
type EditShortcutsAction = {
  type: typeof EnvActionTypes.ENV_EDIT_SHORTCUT
  shortcutNamespace?: KeymapNamespace
  shortcutKey?: string
}
type ToggleDarkModeAction = {
  type: typeof EnvActionTypes.ENV_TOGGLE_DARK_MODE
  darkMode: boolean
}
type UpdateBytePriceAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_BYTE_PRICE
  bytePrice: number
}

export type EnvActions = (
  UpdateProviderAction |
  UpdateNetworkAction |
  SetCurrentAddressAction |
  SetIsMobileAction |
  UpdateIndexHostAction |
  UpdateGatewayHostAction |
  UpdateBeeClientAction |
  UpdateKeymapAction |
  EditShortcutsAction |
  ToggleDarkModeAction |
  UpdateBytePriceAction
)

// Init reducer
const creditHost = window.localStorage.getItem("creditHost") || process.env.REACT_APP_CREDIT_HOST
const indexClient = new EthernaIndexClient({
  host: EthernaIndexClient.defaultHost,
  apiPath: EthernaIndexClient.defaultApiPath
})
const gatewayClient = new EthernaGatewayClient({
  host: EthernaGatewayClient.defaultHost,
  apiPath: EthernaGatewayClient.defaultApiPath
})
const authClient = new EthernaAuthClient({
  host: EthernaAuthClient.defaultHost,
  apiPath: EthernaAuthClient.defaultApiPath
})
const beeClient = new SwarmBeeClient(EthernaGatewayClient.defaultHost)

const initialState: EnvState = {
  indexHost: EthernaIndexClient.defaultHost,
  indexApiPath: EthernaIndexClient.defaultApiPath,
  gatewayHost: EthernaGatewayClient.defaultHost,
  gatewayApiPath: EthernaGatewayClient.defaultApiPath,
  creditHost,
  indexClient,
  gatewayClient,
  authClient,
  beeClient,
  keymap: baseKeymap,
  darkMode: loadDarkMode(),
  isMobile: checkIsMobile(),
  lang,
}

const enviromentReducer = (state: EnvState = initialState, action: EnvActions): EnvState => {
  switch (action.type) {
    case EnvActionTypes.ENV_UPDATE_PROVIDER:
      return {
        ...state,
        web3: action.web3,
        currentWallet: action.currentWallet,
        currentWalletLogo: action.currentWalletLogo,
      }

    case EnvActionTypes.ENV_UPDATE_NETWORK:
      return {
        ...state,
        network: action.network,
      }

    case EnvActionTypes.ENV_SET_CURRENT_ADDRESS:
      return {
        ...state,
        currentAddress: action.currentAddress,
        previusAddress: action.previusAddress,
      }

    case EnvActionTypes.ENV_SET_IS_MOBILE:
      return {
        ...state,
        isMobile: action.isMobile,
      }

    case EnvActionTypes.ENV_UPDATE_INDEXHOST:
      return {
        ...state,
        indexHost: action.indexHost,
        indexApiPath: action.apiPath || "",
        indexClient: action.indexClient,
      }

    case EnvActionTypes.ENV_UPDATE_GATEWAY_HOST:
      return {
        ...state,
        gatewayHost: action.gatewayHost,
        gatewayApiPath: action.apiPath || "",
        beeClient: action.beeClient
      }

    case EnvActionTypes.ENV_UPDATE_BEE_CLIENT:
      return {
        ...state,
        beeClient: action.beeClient
      }

    case EnvActionTypes.ENV_UPDATE_BYTE_PRICE:
      return {
        ...state,
        bytePrice: action.bytePrice
      }

    case EnvActionTypes.ENV_UPDATE_KEYMAP:
      return {
        ...state,
        keymap: action.keymap,
      }

    case EnvActionTypes.ENV_EDIT_SHORTCUT:
      return {
        ...state,
        shortcutNamespace: action.shortcutNamespace,
        shortcutKey: action.shortcutKey,
      }

    case EnvActionTypes.ENV_TOGGLE_DARK_MODE:
      return {
        ...state,
        darkMode: action.darkMode,
      }

    default:
      return state
  }
}

export default enviromentReducer
