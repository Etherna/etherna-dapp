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

import BeeClient from "@/classes/BeeClient"
import type { PostageBatch } from "@/classes/BeeClient/types"
import GatewayClient from "@/classes/GatewayClient"
import IndexClient from "@/classes/IndexClient"
import SSOClient from "@/classes/SSOClient"
import { baseKeymap } from "@/keyboard"
import lang from "@/lang"
import type { GatewayBatch } from "@/types/api-gateway"
import type { EnvState, WalletType } from "@/types/app-state"
import type { GatewayExtensionHost } from "@/types/extension-host"
import type { Keymap, KeymapNamespace } from "@/types/keyboard"
import autoUpgradeEthernaService from "@/utils/autoUpgradeEthernaService"
import { checkIsMobile } from "@/utils/browser"
import { loadColorScheme } from "@/utils/dark-mode"
import { parseLocalStorage } from "@/utils/local-storage"

export const EnvActionTypes = {
  SET_IS_MOBILE: "ENV_SET_IS_MOBILE",
  UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
  UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
  SET_IS_STANDALONE_GATEWAY: "ENV_SET_IS_STANDALONE_GATEWAY",
  UPDATE_BEE_CLIENT: "ENV_UPDATE_BEE_CLIENT",
  UPDATE_BEE_CLIENT_BATCHES: "ENV_UPDATE_BEE_CLIENT_BATCHES",
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
  indexClient: IndexClient
}
type UpdateGatewayHostAction = {
  type: typeof EnvActionTypes.UPDATE_GATEWAY_HOST
  gatewayUrl: string
  beeClient: BeeClient
}
type SetIsStandaloneGatewayAction = {
  type: typeof EnvActionTypes.SET_IS_STANDALONE_GATEWAY
  isStandalone: boolean
}
type UpdateBeeClientAction = {
  type: typeof EnvActionTypes.UPDATE_BEE_CLIENT
  beeClient: BeeClient
  signerWallet: WalletType | null
}
type UpdateBeeClientBatchesAction = {
  type: typeof EnvActionTypes.UPDATE_BEE_CLIENT_BATCHES
  batches: PostageBatch[]
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

export type EnvActions =
  | SetIsMobileAction
  | SetIsStandaloneGatewayAction
  | UpdateIndexHostAction
  | UpdateGatewayHostAction
  | UpdateBeeClientAction
  | UpdateBeeClientBatchesAction
  | UpdateKeymapAction
  | EditShortcutsAction
  | ToggleDarkModeAction
  | UpdateBytePriceAction

// Upagrade deprecated services urls
autoUpgradeEthernaService("setting:index-url", import.meta.env.VITE_APP_INDEX_URL)
autoUpgradeEthernaService("setting:gateway-hosts", import.meta.env.VITE_APP_GATEWAY_URL)
autoUpgradeEthernaService("setting:gateway-url", import.meta.env.VITE_APP_GATEWAY_URL)

// Init reducer
const indexUrl =
  parseLocalStorage<string>("setting:index-url") || import.meta.env.VITE_APP_INDEX_URL
const gatewayUrl =
  parseLocalStorage<string>("setting:gateway-url") || import.meta.env.VITE_APP_GATEWAY_URL
const gatewayType =
  parseLocalStorage<GatewayExtensionHost[]>("setting:gateway-hosts")?.find(
    host => host.url === gatewayUrl
  )?.type ?? "etherna-gateway"
const creditUrl = import.meta.env.VITE_APP_CREDIT_URL
const indexClient = new IndexClient({
  host: IndexClient.defaultHost,
})
const gatewayClient = new GatewayClient({
  host: GatewayClient.defaultHost,
})
const authClient = new SSOClient({
  host: SSOClient.defaultHost,
})
const beeClient = new BeeClient(GatewayClient.defaultHost)

const initialState: EnvState = {
  indexUrl,
  gatewayUrl,
  gatewayType,
  creditUrl,
  indexClient,
  gatewayClient,
  authClient,
  beeClient,
  keymap: baseKeymap,
  darkMode: loadColorScheme(),
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

    case EnvActionTypes.SET_IS_STANDALONE_GATEWAY:
      return {
        ...state,
        isStandaloneGateway: action.isStandalone,
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
        gatewayType:
          parseLocalStorage<GatewayExtensionHost[]>("setting:gateway-hosts")?.find(
            host => host.url === gatewayUrl
          )?.type ?? "etherna-gateway",
        beeClient: action.beeClient,
      }

    case EnvActionTypes.UPDATE_BEE_CLIENT:
      return {
        ...state,
        beeClient: action.beeClient,
        currentWallet: action.signerWallet,
      }

    case EnvActionTypes.UPDATE_BEE_CLIENT_BATCHES:
      return {
        ...state,
        beeClient: new BeeClient(state.beeClient.url, {
          signer: state.beeClient.signer,
          postageBatches: action.batches,
        }),
      }

    case EnvActionTypes.UPDATE_BYTE_PRICE:
      return {
        ...state,
        bytePrice: action.bytePrice,
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
