import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { getDefaultKeymap, mergeKeymaps, optimizeKeymapsForStorage } from "@/keyboard"
import { loadColorScheme, prefersDarkColorScheme } from "@/utils/dark-mode"

import type { Keymaps } from "@/keyboard"
import type { Draft } from "immer"

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

type SetFunc = (setFunc: (state: Draft<SettingsState>) => void) => void
type GetFunc = () => SettingsState

const actions = (set: SetFunc, get: GetFunc) => ({
  switchLocale(locale: string) {
    set(state => {
      state.locale = locale
    })
  },
  toggleDarkMode(enabled: boolean) {
    loadColorScheme(enabled)
    set(state => {
      state.darkMode = enabled
    })
  },
  toggleZenMode(enabled: boolean) {
    set(state => {
      state.zenMode = enabled
    })
  },
  updateKeymap(keymap: Keymaps) {
    set(state => {
      state.keymap = keymap
    })
  },
})

const useSettingsStore = create<SettingsState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          ...actions(set, get),
        })),
        {
          name: "etherna:settings",
          storage: {
            getItem(name) {
              const serializedValue = localStorage.getItem(name)
              const state = serializedValue
                ? (JSON.parse(serializedValue) as StorageValue<SettingsState & SettingsActions>)
                : null
              if (state) {
                const mergedKeymap = mergeKeymaps(getDefaultKeymap(), state.state.keymap)
                state.state.keymap = mergedKeymap
              }

              loadColorScheme(state?.state?.darkMode ?? prefersDarkColorScheme())

              return state
            },
            setItem(name, value) {
              localStorage.setItem(
                name,
                JSON.stringify({
                  ...value,
                  state: {
                    ...value.state,
                    keymap: optimizeKeymapsForStorage(value.state.keymap),
                  },
                })
              )
            },
            removeItem(name) {
              localStorage.removeItem(name)
            },
          },
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
        }
      ),
      {
        name: "settings",
      }
    )
  )
)

export default useSettingsStore
