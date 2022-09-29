import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

export type WalletType = "etherna" | "metamask"

export type SessionState = {
  bytesPrice?: number
  apiVersion: {
    [url: string]: string
  }
}

export type SessionActions = {
  setBytesPrice(bytesPrice: number | undefined): void
  setApiVersion(url: string, version: string): void
}

const getInitialState = (): SessionState => ({
  apiVersion: {
    [import.meta.env.VITE_APP_SSO_URL]: import.meta.env.VITE_APP_API_VERSION,
    [import.meta.env.VITE_APP_CREDIT_URL]: import.meta.env.VITE_APP_API_VERSION,
    [import.meta.env.VITE_APP_INDEX_URL]: import.meta.env.VITE_APP_API_VERSION,
    [import.meta.env.VITE_APP_GATEWAY_URL]: import.meta.env.VITE_APP_API_VERSION,
  },
})

const useSessionStore = create<SessionState & SessionActions>()(
  logger(
    devtools(
      persist(
        immer(set => ({
          ...getInitialState(),
          setApiVersion(url, version) {
            set(state => {
              state.apiVersion[url] = version
            })
          },
          setBytesPrice(bytesPrice) {
            set(state => {
              state.bytesPrice = bytesPrice
            })
          },
        })),
        {
          name: "etherna:session",
          getStorage: () => sessionStorage,
        }
      ),
      {
        name: "session",
      }
    )
  )
)

export default useSessionStore
