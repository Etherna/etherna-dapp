import { Bzz, Response } from "@erebos/bzz"

import { baseKeymap } from "@keyboard"
import { Keymap, KeymapNamespace } from "@keyboard/typings"
import lang from "@lang"
import { loadDarkMode } from "@state/actions/enviroment/darkMode"
import { EnvState } from "@state/typings"
import GatewayClient from "@utils/gatewayClient/client"
import IndexClient from "@utils/indexClient/client"
import { Crop } from "react-image-crop"
import Web3 from "web3"

export const EnvActionTypes = {
  ENV_UPDATE_PROVIDER: "ENV_UPDATE_PROVIDER",
  ENV_UPDATE_NETWORK: "ENV_UPDATE_NETWORK",
  ENV_SET_CURRENT_ADDRESS: "ENV_SET_CURRENT_ADDRESS",
  ENV_SET_IS_MOBILE: "ENV_SET_IS_MOBILE",
  ENV_UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
  ENV_UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
  ENV_UPDATE_KEYMAP: "ENV_UPDATE_KEYMAP",
  ENV_EDIT_SHORTCUT: "ENV_EDIT_SHORTCUT",
  ENV_TOGGLE_DARK_MODE: "ENV_TOGGLE_DARK_MODE",
  ENV_SET_CROP_IMAGE: "ENV_SET_CROP_IMAGE",
  ENV_UPDATE_IMAGE_CROP: "ENV_UPDATE_IMAGE_CROP",
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
  network?: string|null
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
  indexClient: IndexClient
}
type UpdateGatewayHostAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_GATEWAY_HOST
  gatewayHost: string
  apiPath: string | null | undefined
  bzzClient: Bzz<any, Response<any>, any>
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
type SetCropImageAction = {
  type: typeof EnvActionTypes.ENV_SET_CROP_IMAGE
  imageType: string
  image: string
}
type UpdateImageCropAction = {
  type: typeof EnvActionTypes.ENV_UPDATE_IMAGE_CROP
  imageCrop?: Crop
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
  UpdateKeymapAction |
  EditShortcutsAction |
  ToggleDarkModeAction |
  SetCropImageAction |
  UpdateImageCropAction |
  UpdateBytePriceAction
)

// Init reducer

const indexHost = window.localStorage.getItem("indexHost") || process.env.REACT_APP_INDEX_HOST!
const indexApiPath = window.localStorage.getItem("indexApiPath") != null
  ? window.localStorage.getItem("indexApiPath")!
  : process.env.REACT_APP_INDEX_API_PATH!
const gatewayHost = window.localStorage.getItem("gatewayHost") ||
  process.env.REACT_APP_GATEWAY_HOST ||
  "https://swarm-gateways.net"
const gatewayApiPath = window.localStorage.getItem("gatewayApiPath") != null
  ? window.localStorage.getItem("gatewayApiPath")!
  : process.env.REACT_APP_GATEWAY_API_PATH!
const creditHost = window.localStorage.getItem("creditHost") || process.env.REACT_APP_CREDIT_HOST!

const indexClient = new IndexClient({ host: indexHost, apiPath: indexApiPath })
const gatewayClient = new GatewayClient({ host: gatewayHost, apiPath: gatewayApiPath })
const bzzClient = new Bzz({ url: gatewayHost })

// update fetch to include credentials
const credentialsFetch = (input: RequestInfo, init?: RequestInit | undefined) => {
  return fetch(input, { ...(init || {}), credentials: "include" })
}
(bzzClient as any).fetch = credentialsFetch

const initialState: EnvState = {
  indexHost,
  indexApiPath,
  gatewayHost,
  gatewayApiPath,
  creditHost,
  indexClient,
  gatewayClient,
  bzzClient,
  keymap: baseKeymap,
  darkMode: loadDarkMode(),
  isMobile: false,
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
        bzzClient: action.bzzClient
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

    case EnvActionTypes.ENV_UPDATE_IMAGE_CROP:
      return {
        ...state,
        imageCrop: action.imageCrop,
      }

    case EnvActionTypes.ENV_SET_CROP_IMAGE:
      return {
        ...state,
        imageType: action.imageType,
        image: action.image,
      }

    default:
      return state
  }
}

export default enviromentReducer
