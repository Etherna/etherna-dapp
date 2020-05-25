import Web3 from "web3"
import { Account as Wallet } from "web3-core"
import { Crop } from "react-image-crop"
import Lang from "lang.js"
import { Keymap } from "@keyboard"

export interface RootState {
    env: EnvState
    profile: ProfileState
    ui: UIState
    user: UserState
}

export interface EnvState {
    indexHost: string
    gatewayHost: string
    keymap: Keymap
    lang: Lang
    isMobile: boolean
    darkMode: boolean

    wallet?: Wallet
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
    username?: string
    ens?: string
    isSignedIn: boolean
}


interface SwarmImage {
    url: string
    hash: string
}