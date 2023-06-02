import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { GatewayExtensionHost, GatewayType, IndexExtensionHost } from "@/types/extension-host"
import type { WritableDraft } from "immer/dist/internal"

export type ExtensionsState = {
  gatewaysList: GatewayExtensionHost[]
  indexesList: IndexExtensionHost[]
  currentIndexUrl: string
  currentGatewayUrl: string
  currentGatewayType: GatewayType
  currentCreditUrl: string
}

const getInitialState = (): ExtensionsState => ({
  indexesList: [{ name: "Etherna Index", url: import.meta.env.VITE_APP_INDEX_URL }],
  gatewaysList: [
    { name: "Etherna Gateway", url: import.meta.env.VITE_APP_GATEWAY_URL, type: "etherna-gateway" },
  ],
  currentIndexUrl: import.meta.env.VITE_APP_INDEX_URL,
  currentGatewayUrl: import.meta.env.VITE_APP_GATEWAY_URL,
  currentGatewayType: "etherna-gateway",
  currentCreditUrl: import.meta.env.VITE_APP_CREDIT_URL,
})

type SetFunc = (setFunc: (state: WritableDraft<ExtensionsState>) => void) => void
type GetFunc = () => ExtensionsState

const actions = (set: SetFunc, get: GetFunc) => ({
  addGateway(gateway: GatewayExtensionHost) {
    set(state => {
      state.gatewaysList.push(gateway)
    })
  },
  addIndex(index: IndexExtensionHost) {
    set(state => {
      state.indexesList.push(index)
    })
  },
  removeGateway(gatewayUrl: string) {
    set(state => {
      state.gatewaysList = state.gatewaysList.filter(gateway => gateway.url !== gatewayUrl)
    })
  },
  removeIndex(indexUrl: string) {
    set(state => {
      state.indexesList = state.indexesList.filter(index => index.url !== indexUrl)
    })
  },
  updateIndex(oldIndexUrl: string, info: IndexExtensionHost) {
    set(state => {
      state.indexesList = state.indexesList.map(index => {
        if (index.url === oldIndexUrl) {
          return info
        }
        return index
      })
    })
  },
  updateGateway(oldGatewayUrl: string, info: GatewayExtensionHost) {
    set(state => {
      state.gatewaysList = state.gatewaysList.map(gateway => {
        if (gateway.url === oldGatewayUrl) {
          return info
        }
        return gateway
      })
    })
  },
  setCurrentGatewayUrl(gatewayUrl: string) {
    set(state => {
      state.currentGatewayUrl = gatewayUrl
      state.currentGatewayType =
        state.gatewaysList.find(gateway => gateway.url === gatewayUrl)?.type ?? "etherna-gateway"
    })
  },
  setCurrentIndexUrl(indexUrl: string) {
    set(state => {
      state.currentIndexUrl = indexUrl
    })
  },
})

const useExtensionsStore = create<ExtensionsState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          ...actions(set, get),
        })),
        {
          name: "etherna:extensions",
          storage: createJSONStorage(() => localStorage),
        }
      ),
      {
        name: "extensions",
      }
    )
  )
)

export default useExtensionsStore
