import Web3 from "web3"
import { Crop } from "react-image-crop"
import Lang from "lang.js"
import { Keymap } from "@keyboard"
import IndexClient from "@utils/indexClient/client"
import GatewayClient from "@utils/gatewayClient/client"
import { Bzz } from "@erebos/bzz"

export interface RootState {
  env: EnvState
  profile: ProfileState
  ui: UIState
  user: UserState
}

export interface EnvState {
  indexHost: string
  indexApiPath: string
  gatewayHost: string
  gatewayApiPath: string
  indexClient: IndexClient
  gatewayClient: GatewayClient
  bzzClient: Bzz<any, Response<any>, any>
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

  shortcutNamespace?: string
  shortcutKey?: string

  imageCrop?: Crop
  imageType?: string
  image?: string
}

export interface ProfileState {
  name?: string
  description?: string
  avatar?: SwarmImage
  cover?: SwarmImage
  location?: string
  website?: string
  birthday?: string
  existsOnIndex?: boolean
}

export interface UIState {
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

export interface UserState {
  address?: string
  identityManifest?: string
  prevAddresses?: string[]
  ens?: string
  credit: number
  isSignedIn: boolean
  isSignedInGateway: boolean
}


interface SwarmImage {
  url: string
  hash: string
  isRaw: boolean
}
