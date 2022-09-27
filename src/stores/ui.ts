import type { Crop } from "react-image-crop"
import create from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import type { KeymapNamespace } from "@/types/keyboard"

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
}

export type UIActions = {
  showBeeAuthentication(): void
  hideBeeAuthentication(): void
  showCropImage(type: "avatar" | "cover", imageDataURL: string): void
  hideCropImage(): void
  showError(title: string, message?: string): void
  hideError(): void
  showConfirmation(
    title: string,
    message?: string,
    buttonTitle?: string,
    buttonType?: "default" | "destructive"
  ): void
  hideConfirmation(): void
  toggleProfileLoading(loading: boolean): void
  toggleSidebar(show: boolean): void
  toggleFloatingSidebar(floating: boolean): void
  showExtension(type: ExtensionType): void
  hideExtension(): void
  showShortcut(namespace: KeymapNamespace, key: string): void
  hideShortcut(): void
}

const getInitialState = (): UIState => ({
  showSidebar: false,
  floatingSidebar: false,
})

const useUIStore = create<UIState & UIActions>()(
  logger(
    devtools(
      immer(set => ({
        ...getInitialState(),
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
        showConfirmation(title, message, buttonTitle, buttonType = "default") {
          set(state => {
            state.confirmation = {
              title,
              message,
              buttonTitle,
              buttonType,
            }
          })
        },
        showCropImage(type, image) {
          set(state => {
            state.cropping = {
              type,
              crop: {},
              image,
            }
          })
        },
        showError(title, message) {
          set(state => {
            state.error = {
              title,
              message,
            }
          })
        },
        showExtension(type) {
          set(state => {
            state.extension = {
              type,
            }
          })
        },
        showShortcut(namespace, key) {
          set(state => {
            state.shortcut = {
              namespace,
              key,
            }
          })
        },
        toggleFloatingSidebar(floating) {
          set(state => {
            state.floatingSidebar = floating
          })
        },
        toggleProfileLoading(loading) {
          set(state => {
            state.isLoadingProfile = loading
          })
        },
        toggleSidebar(show) {
          set(state => {
            state.showSidebar = show
          })
        },
      })),
      {
        name: "ui",
      }
    )
  )
)

export default useUIStore
