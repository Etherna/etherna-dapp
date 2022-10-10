import create from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import type { Keymaps } from "@/keyboard"
import { getDefaultKeymap, mergeKeymaps, optimizeKeymapsForStorage } from "@/keyboard"
import { loadColorScheme, prefersDarkColorScheme } from "@/utils/dark-mode"

type StorageValue<S> = {
  state: S
  version?: number
}

export type SettingsState = {
  keymap: Keymaps
  locale: string
  darkMode: boolean
  zenMode: boolean
}

export type SettingsActions = {
  switchLocale(locale: string): void
  toggleDarkMode(enabled: boolean): void
  toggleZenMode(enabled: boolean): void
  updateKeymap(keymap: Keymaps): void
}

const getInitialState = (): SettingsState => ({
  keymap: getDefaultKeymap(),
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
          merge(persistedState, currentState) {
            if (persistedState === undefined) {
              // first time
              loadColorScheme(prefersDarkColorScheme())
            }

            return {
              ...currentState,
              ...(persistedState as StorageValue<SettingsState>),
            }
          },
          serialize(state) {
            return JSON.stringify({
              ...state,
              state: {
                ...state.state,
                keymap: optimizeKeymapsForStorage(state.state.keymap),
              },
            })
          },
          deserialize(str) {
            const state = JSON.parse(str) as StorageValue<SettingsState & SettingsActions>
            const mergedKeymap = mergeKeymaps(getDefaultKeymap(), state.state.keymap)
            state.state.keymap = mergedKeymap

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
