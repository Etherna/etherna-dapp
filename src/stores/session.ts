import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { Draft } from "immer"

export type WalletType = "etherna" | "metamask"

export type SessionState = {
  bytesPrice?: number
  apiVersion: {
    [url: string]: string
  }
  characterLimits?: {
    comment: number
    title: number
    description: number
  }
}

const getInitialState = (): SessionState => ({
  apiVersion: {
    [import.meta.env.VITE_APP_SSO_URL]: import.meta.env.VITE_APP_API_VERSION,
    [import.meta.env.VITE_APP_CREDIT_URL]: import.meta.env.VITE_APP_API_VERSION,
    [import.meta.env.VITE_APP_INDEX_URL]: import.meta.env.VITE_APP_API_VERSION,
    [import.meta.env.VITE_APP_GATEWAY_URL]: import.meta.env.VITE_APP_API_VERSION,
  },
})

type SetFunc = (setFunc: (state: Draft<SessionState>) => void) => void
type GetFunc = () => SessionState

const actions = (set: SetFunc, get: GetFunc) => ({
  setApiVersion(url: string, version: string) {
    set(state => {
      state.apiVersion[url] = version
    })
  },
  setBytesPrice(bytesPrice: number | undefined) {
    set(state => {
      state.bytesPrice = bytesPrice
    })
  },
  setCharaterLimits(comment: number, title: number, description: number) {
    set(state => {
      state.characterLimits = {
        comment,
        title,
        description,
      }
    })
  },
})

const useSessionStore = create<SessionState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          ...actions(set, get),
        })),
        {
          name: "etherna:session",
          storage: createJSONStorage(() => sessionStorage),
        }
      ),
      {
        name: "session",
      }
    )
  )
)

export default useSessionStore
