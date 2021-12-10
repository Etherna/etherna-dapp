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

import Lang from "lang.js"
import { Crop } from "react-image-crop"

import { Keymap, KeymapNamespace } from "@keyboard/typings"
import EthernaGatewayClient from "@classes/EthernaGatewayClient"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import EthernaAuthClient from "@classes/EthernaAuthClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import SwarmImage from "@classes/SwarmImage"

export type AppState = {
  env: EnvState
  profile: ProfileState
  ui: UIState
  user: UserState
}

export type EnvState = {
  indexUrl: string
  gatewayUrl: string
  creditUrl: string
  indexClient: EthernaIndexClient
  gatewayClient: EthernaGatewayClient
  authClient: EthernaAuthClient
  beeClient: SwarmBeeClient
  bytePrice?: number

  keymap: Keymap
  lang: Lang
  isMobile: boolean
  darkMode: boolean

  currentWallet?: string
  currentWalletLogo?: string
  currentAddress?: string
  previusAddress?: string

  shortcutNamespace?: KeymapNamespace
  shortcutKey?: string
}

export type ProfileState = {
  name?: string
  description?: string
  avatar?: SwarmImage
  cover?: SwarmImage
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
  showUnsupportedModal?: boolean
  showNetwokChangeModal?: boolean
  isEditingShortcut?: boolean
  isCroppingImage?: boolean

  imageCrop?: Partial<Crop>
  imageType?: "avatar" | "cover"
  image?: string

  extensionName?: "index" | "gateway"
  extensionUrl?: string
}

export type UserState = {
  address?: string
  identityManifest?: string
  prevAddresses?: string[]
  ens?: string | null
  credit?: number
  isSignedIn?: boolean
  isSignedInGateway?: boolean
}
