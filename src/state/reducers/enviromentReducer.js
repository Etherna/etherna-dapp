import { Bzz } from "@erebos/bzz"

import { baseKeymap } from "@keyboard"
import lang from "@lang"
import { loadDarkMode } from "@state/actions/enviroment/darkMode"
import IndexClient from "@utils/indexClient/client"

export const EnvActionTypes = {
  ENV_UPDATE_PROVIDER: "ENV_UPDATE_PROVIDER",
  ENV_UPDATE_WALLET: "ENV_UPDATE_WALLET",
  ENV_UPDATE_NETWORK: "ENV_UPDATE_NETWORK",
  ENV_CURRENT_ADDRESS: "ENV_CURRENT_ADDRESS",
  ENV_IS_MOBILE: "ENV_IS_MOBILE",
  ENV_UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
  ENV_UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
  UPDATE_KEYMAP: "UPDATE_KEYMAP",
  EDIT_SHORTCUT: "EDIT_SHORTCUT",
  TOGGLE_DARK_MODE: "TOGGLE_DARK_MODE",
  SET_CROP_IMAGE: "SET_CROP_IMAGE",
  UPDATE_IMAGE_CROP: "UPDATE_IMAGE_CROP",
}

const indexHost = window.localStorage.getItem("indexHost") || process.env.REACT_APP_INDEX_HOST
const indexApiPath = window.localStorage.getItem("indexApiPath") != null
  ? window.localStorage.getItem("indexApiPath")
  : process.env.REACT_APP_INDEX_API_PATH
const gatewayHost = window.localStorage.getItem("gatewayHost") ||
  process.env.REACT_APP_GATEWAY_HOST ||
  "https://swarm-gateways.net"
const indexClient = new IndexClient({ host: indexHost, apiPath: indexApiPath })
const bzzClient = new Bzz({ url: gatewayHost })

/** @type {import("..").EnvState} */
const initialState = {
  indexHost,
  indexApiPath,
  indexClient,
  bzzClient,
  gatewayHost,
  keymap: baseKeymap,
  darkMode: loadDarkMode(),
  lang,
}

/**
 * @param {import("..").EnvState} state
 * @param {object} action
 * @returns {import("..").EnvState}
 */
const enviromentReducer = (state = initialState, action) => {
  switch (action.type) {
    case EnvActionTypes.ENV_UPDATE_PROVIDER:
      return {
        ...state,
        web3: action.web3,
        currentWallet: action.currentWallet,
        currentWalletLogo: action.currentWalletLogo,
      }

    case EnvActionTypes.ENV_UPDATE_WALLET:
      return {
        ...state,
        wallet: action.wallet,
      }

    case EnvActionTypes.ENV_UPDATE_NETWORK:
      return {
        ...state,
        network: action.network,
      }

    case EnvActionTypes.ENV_CURRENT_ADDRESS:
      return {
        ...state,
        currentAddress: action.currentAddress,
        previusAddress: action.previusAddress,
      }

    case EnvActionTypes.ENV_IS_MOBILE:
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
        bzzClient: action.bzzClient
      }

    case EnvActionTypes.UPDATE_KEYMAP:
      return {
        ...state,
        keymap: action.keymap,
      }

    case EnvActionTypes.EDIT_SHORTCUT:
      return {
        ...state,
        shortcutNamespace: action.shortcutNamespace,
        shortcutKey: action.shortcutKey,
      }

    case EnvActionTypes.TOGGLE_DARK_MODE:
      return {
        ...state,
        darkMode: action.darkMode,
      }

    case EnvActionTypes.UPDATE_IMAGE_CROP:
      return {
        ...state,
        imageCrop: action.imageCrop,
      }

    case EnvActionTypes.SET_CROP_IMAGE:
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
