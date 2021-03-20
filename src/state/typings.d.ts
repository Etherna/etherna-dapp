import Web3 from "web3"
import Lang from "lang.js"
import { Crop } from "react-image-crop"

import { Keymap, KeymapNamespace } from "@keyboard/typings"
import EthernaGatewayClient from "@classes/EthernaGatewayClient"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import SwarmImage from "@classes/SwarmImage"

export type AppState = {
  env: EnvState
  profile: ProfileState
  ui: UIState
  user: UserState
}

export type EnvState = {
  indexHost: string
  indexApiPath: string
  gatewayHost: string
  gatewayApiPath: string
  creditHost: string
  indexClient: EthernaIndexClient
  gatewayClient: EthernaGatewayClient
  beeClient: SwarmBeeClient
  bytePrice?: number

  keymap: Keymap
  lang: Lang
  isMobile: boolean
  darkMode: boolean

  web3?: Web3
  currentWallet?: string
  currentWalletLogo?: string
  network?: string | null
  currentAddress?: string
  previusAddress?: string

  shortcutNamespace?: KeymapNamespace
  shortcutKey?: string

  imageCrop?: Crop
  imageType?: string
  image?: string
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
  isConnectingWallet?: boolean
  isLoadingProfile?: boolean
  isLoadingProfile?: boolean
  showUnsupportedModal?: boolean
  showNetwokChangeModal?: boolean
  isEditingShortcut?: boolean
  isCroppingImage?: boolean
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
