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

import type Lang from "lang.js"
import type { Crop } from "react-image-crop"

import type EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import type EthernaIndexClient from "@/classes/EthernaIndexClient"
import type EthernaAuthClient from "@/classes/EthernaAuthClient"
import type SwarmBeeClient from "@/classes/SwarmBeeClient"
import type { SwarmImage } from "./swarm-image"
import type { Keymap, KeymapNamespace } from "./keyboard"
import type { GatewayBatch } from "./api-gateway"
import type { GatewayType } from "./extension-host"

export type AppState = {
  env: EnvState
  profile: ProfileState
  ui: UIState
  user: UserState
}

export type EnvState = {
  indexUrl: string
  gatewayUrl: string
  gatewayType: GatewayType
  creditUrl: string
  indexClient: EthernaIndexClient
  gatewayClient: EthernaGatewayClient
  authClient: EthernaAuthClient
  beeClient: SwarmBeeClient
  bytePrice?: number
  isStandaloneGateway?: boolean

  keymap: Keymap
  lang: Lang
  isMobile: boolean
  darkMode: boolean

  currentWallet?: WalletType | null
  currentAddress?: string
  previusAddress?: string

  shortcutNamespace?: KeymapNamespace
  shortcutKey?: string
}

export type ProfileState = {
  name?: string
  description?: string
  avatar?: SwarmImage | null
  cover?: SwarmImage | null
  location?: string
  website?: string
  birthday?: string
  existsOnIndex?: boolean
}

export type UIState = {
  errorTitle?: string
  errorMessage?: string

  confirmTitle?: string
  confirmMessage?: string
  confirmButtonTitle?: string
  confirmButtonType?: "default" | "destructive"

  isConnectingWallet?: boolean
  isLoadingProfile?: boolean
  showNetwokChangeModal?: boolean
  isEditingShortcut?: boolean
  isCroppingImage?: boolean

  imageCrop?: Partial<Crop>
  imageType?: "avatar" | "cover"
  image?: string

  extensionName?: ExtensionType
  extensionUrl?: string
}

export type UserState = {
  address?: string
  prevAddresses?: string[]
  ens?: string | null
  credit?: number | null
  creditUnlimited?: boolean
  isSignedIn?: boolean
  isSignedInGateway?: boolean
  batches?: GatewayBatch[]
}

export type WalletType = "etherna" | "metamask"

export type ExtensionType = "index" | "gateway"
