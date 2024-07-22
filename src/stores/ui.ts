import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { Crop } from "react-image-crop"
import type { KeymapNamespace } from "@/types/keyboard"
import type { Draft } from "immer"

export type ExtensionType = "index" | "gateway"

export type UIState = {
  confirmation?: {
    title: string
    buttonTitle?: string
    buttonType?: "default" | "destructive"
    message?: string
  }
  cropping?: { crop: Partial<Crop>; type: "avatar" | "cover"; image: string }
  error?: { title: string; message?: string }
  extension?: { type: ExtensionType }
  floatingSidebar: boolean
  isAuthenticatingBee?: boolean
  isLoadingProfile?: boolean
  shortcut?: { namespace: KeymapNamespace; key: string; shortcut?: string }
  showSidebar: boolean
  showPlaylistCreation?: boolean
}

const getInitialState = (): UIState => ({
  showSidebar: false,
  floatingSidebar: false,
})

type SetFunc = (setFunc: (state: Draft<UIState>) => void) => void
type GetFunc = () => UIState

const actions = (set: SetFunc, get: GetFunc) => ({
  hideBeeAuthentication() {
    set(state => {
      state.isAuthenticatingBee = false
    })
  },
  hideConfirmation() {
    set(state => {
      state.confirmation = undefined
    })
  },
  hideCropImage() {
    set(state => {
      state.cropping = undefined
    })
  },
  hideError() {
    set(state => {
      state.error = undefined
    })
  },
  hideExtension() {
    set(state => {
      state.extension = undefined
    })
  },
  hideShortcut() {
    set(state => {
      state.shortcut = undefined
    })
  },
  showBeeAuthentication() {
    set(state => {
      state.isAuthenticatingBee = true
    })
  },
  showConfirmation(
    title: string,
    message?: string,
    buttonTitle?: string,
    buttonType: "default" | "destructive" = "default"
  ) {
    set(state => {
      state.confirmation = {
        title,
        message,
        buttonTitle,
        buttonType,
      }
    })
  },
  showCropImage(type: "avatar" | "cover", imageDataURL: string) {
    set(state => {
      state.cropping = {
        type,
        crop: {},
        image: imageDataURL,
      }
    })
  },
  showError(title: string, message?: string) {
    set(state => {
      state.error = {
        title,
        message,
      }
    })
  },
  showExtension(type: ExtensionType) {
    set(state => {
      state.extension = {
        type,
      }
    })
  },
  showShortcut(namespace: KeymapNamespace, key: string) {
    set(state => {
      state.shortcut = {
        namespace,
        key,
      }
    })
  },
  toggleFloatingSidebar(floating: boolean) {
    set(state => {
      state.floatingSidebar = floating
    })
  },
  toggleProfileLoading(loading: boolean) {
    set(state => {
      state.isLoadingProfile = loading
    })
  },
  toggleSidebar(show: boolean) {
    set(state => {
      state.showSidebar = show
    })
  },
  togglePlaylistCreation(show: boolean) {
    set(state => {
      state.showPlaylistCreation = show
    })
  },
})

const useUIStore = create<UIState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      immer((set, get) => ({
        ...getInitialState(),
        ...actions(set, get),
      })),
      {
        name: "ui",
      }
    )
  )
)

export default useUIStore
