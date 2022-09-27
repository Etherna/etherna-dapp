import create from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { defaultKeymap } from "@/keyboard"
import type { Keymap } from "@/types/keyboard"
import { loadColorScheme, prefersDarkColorScheme } from "@/utils/dark-mode"

export type SettingsState = {
  keymap: Keymap
  locale: string
  darkMode: boolean
  zenMode: boolean
}

export type SettingsActions = {
  switchLocale(locale: string): void
  toggleDarkMode(enabled: boolean): void
  toggleZenMode(enabled: boolean): void
  updateKeymap(keymap: Keymap): void
}

const getInitialState = (): SettingsState => ({
  keymap: defaultKeymap,
  locale: "en",
  darkMode: prefersDarkColorScheme(),
  zenMode: false,
})

const useSettingsStore = create<SettingsState & SettingsActions>()(
  logger(
    devtools(
      persist(
        immer(set => ({
          ...getInitialState(),
          switchLocale(locale) {
            set(state => {
              state.locale = locale
            })
          },
          toggleDarkMode(enabled) {
            loadColorScheme(enabled)
            set(state => {
              state.darkMode = enabled
            })
          },
          toggleZenMode(enabled) {
            set(state => {
              state.zenMode = enabled
            })
          },
          updateKeymap(keymap) {
            set(state => {
              state.keymap = keymap
            })
          },
        })),
        {
          name: "etherna:settings",
          getStorage: () => localStorage,
          deserialize(str) {
            const state = JSON.parse(str)
            loadColorScheme(state?.state?.darkMode ?? prefersDarkColorScheme())
            return state
          },
        }
      ),
      {
        name: "settings",
      }
    )
  )
)

export default useSettingsStore
