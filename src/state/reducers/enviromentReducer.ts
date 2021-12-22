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

import { baseKeymap } from "@keyboard"
import lang from "@lang"
import EthernaGatewayClient from "@classes/EthernaGatewayClient"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import EthernaAuthClient from "@classes/EthernaAuthClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { loadDarkMode } from "@state/actions/enviroment/darkMode"
import { checkIsMobile } from "@utils/browser"
import { parseLocalStorage } from "@utils/localStorage"
import type { EnvState } from "@definitions/app-state"
import type { Keymap, KeymapNamespace } from "@definitions/keyboard"

export const EnvActionTypes = {
  SET_IS_MOBILE: "ENV_SET_IS_MOBILE",
  UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
  UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
  UPDATE_BEE_CLIENT: "ENV_UPDATE_BEE_CLIENT",
  UPDATE_KEYMAP: "ENV_UPDATE_KEYMAP",
  EDIT_SHORTCUT: "ENV_EDIT_SHORTCUT",
  TOGGLE_DARK_MODE: "ENV_TOGGLE_DARK_MODE",
  UPDATE_BYTE_PRICE: "ENV_UPDATE_BYTE_PRICE",
} as const

// Export dispatch actions
type SetIsMobileAction = {
  type: typeof EnvActionTypes.SET_IS_MOBILE
  isMobile: boolean
}
type UpdateIndexHostAction = {
  type: typeof EnvActionTypes.UPDATE_INDEXHOST
  indexUrl: string
  indexClient: EthernaIndexClient
}
type UpdateGatewayHostAction = {
  type: typeof EnvActionTypes.UPDATE_GATEWAY_HOST
  gatewayUrl: string
  beeClient: SwarmBeeClient
}
type UpdateBeeClientAction = {
  type: typeof EnvActionTypes.UPDATE_BEE_CLIENT
  beeClient: SwarmBeeClient
}
type UpdateKeymapAction = {
  type: typeof EnvActionTypes.UPDATE_KEYMAP
  keymap: Keymap
}
type EditShortcutsAction = {
  type: typeof EnvActionTypes.EDIT_SHORTCUT
  shortcutNamespace?: KeymapNamespace
  shortcutKey?: string
}
type ToggleDarkModeAction = {
  type: typeof EnvActionTypes.TOGGLE_DARK_MODE
  darkMode: boolean
}
type UpdateBytePriceAction = {
  type: typeof EnvActionTypes.UPDATE_BYTE_PRICE
  bytePrice: number
}

export type EnvActions = (
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
const indexUrl = parseLocalStorage<string>("setting:index-url") || import.meta.env.VITE_APP_INDEX_URL
const gatewayUrl = parseLocalStorage<string>("setting:gateway-url") || import.meta.env.VITE_APP_GATEWAY_URL
const creditUrl = parseLocalStorage<string>("setting:credit-url") || import.meta.env.VITE_APP_CREDIT_URL
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
  indexUrl,
  gatewayUrl,
  creditUrl,
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
    case EnvActionTypes.SET_IS_MOBILE:
      return {
        ...state,
        isMobile: action.isMobile,
      }

    case EnvActionTypes.UPDATE_INDEXHOST:
      return {
        ...state,
        indexUrl: action.indexUrl,
        indexClient: action.indexClient,
      }

    case EnvActionTypes.UPDATE_GATEWAY_HOST:
      return {
        ...state,
        gatewayUrl: action.gatewayUrl,
        beeClient: action.beeClient
      }

    case EnvActionTypes.UPDATE_BEE_CLIENT:
      return {
        ...state,
        beeClient: action.beeClient
      }

    case EnvActionTypes.UPDATE_BYTE_PRICE:
      return {
        ...state,
        bytePrice: action.bytePrice
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

    default:
      return state
  }
}

export default enviromentReducer
