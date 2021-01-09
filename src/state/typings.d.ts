import Web3 from "web3"
import { Crop } from "react-image-crop"
import Lang from "lang.js"
import { Bzz } from "@erebos/bzz"

import { AnyShortcut, Keymap, KeymapNamespace } from "@keyboard/typings"
import IndexClient from "@utils/indexClient/client"
import GatewayClient from "@utils/gatewayClient/client"
import { SwarmImage } from "@utils/swarmProfile"

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
  indexClient: IndexClient
  gatewayClient: GatewayClient
  bzzClient: Bzz<any, Response<any>, any>
  bytePrice?: number

  keymap: Keymap
  lang: Lang
  isMobile: boolean
  darkMode: boolean

  web3?: Web3
  currentWallet?: string
  currentWalletLogo?: string
  network?: string
  currentAddress?: string
  previusAddress?: string

  shortcutNamespace?: KeymapNamespace
  shortcutKey?: AnyShortcut

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
  isConnectingWallet?: boolean
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
  ens?: string
  credit?: number
  isSignedIn?: boolean
  isSignedInGateway?: boolean
}
