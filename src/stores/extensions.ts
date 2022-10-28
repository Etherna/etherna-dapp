import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { GatewayExtensionHost, GatewayType, IndexExtensionHost } from "@/types/extension-host"

export type ExtensionsState = {
  gatewaysList: GatewayExtensionHost[]
  indexesList: IndexExtensionHost[]
  currentIndexUrl: string
  currentGatewayUrl: string
  currentGatewayType: GatewayType
  currentCreditUrl: string
}

export type ExtensionsActions = {
  addIndex(index: IndexExtensionHost): void
  addGateway(gateway: GatewayExtensionHost): void
  removeIndex(indexUrl: string): void
  removeGateway(gatewayUrl: string): void
  updateIndex(oldIndexUrl: string, info: IndexExtensionHost): void
  updateGateway(oldGatewayUrl: string, info: GatewayExtensionHost): void
  setCurrentIndexUrl(indexUrl: string): void
  setCurrentGatewayUrl(gatewayUrl: string): void
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

const useExtensionsStore = create<ExtensionsState & ExtensionsActions>()(
  logger(
    devtools(
      persist(
        immer(set => ({
          ...getInitialState(),
          addGateway(gateway) {
            set(state => {
              state.gatewaysList.push(gateway)
            })
          },
          addIndex(index) {
            set(state => {
              state.indexesList.push(index)
            })
          },
          removeGateway(gatewayUrl) {
            set(state => {
              state.gatewaysList = state.gatewaysList.filter(gateway => gateway.url !== gatewayUrl)
            })
          },
          removeIndex(indexUrl) {
            set(state => {
              state.indexesList = state.indexesList.filter(index => index.url !== indexUrl)
            })
          },
          updateIndex(oldIndexUrl, info) {
            set(state => {
              state.indexesList = state.indexesList.map(index => {
                if (index.url === oldIndexUrl) {
                  return info
                }
                return index
              })
            })
          },
          updateGateway(oldGatewayUrl, info) {
            set(state => {
              state.gatewaysList = state.gatewaysList.map(gateway => {
                if (gateway.url === oldGatewayUrl) {
                  return info
                }
                return gateway
              })
            })
          },
          setCurrentGatewayUrl(gatewayUrl) {
            set(state => {
              state.currentGatewayUrl = gatewayUrl
              state.currentGatewayType =
                state.gatewaysList.find(gateway => gateway.url === gatewayUrl)?.type ??
                "etherna-gateway"
            })
          },
          setCurrentIndexUrl(indexUrl) {
            set(state => {
              state.currentIndexUrl = indexUrl
            })
          },
        })),
        {
          name: "etherna:extensions",
          getStorage: () => localStorage,
        }
      ),
      {
        name: "extensions",
      }
    )
  )
)

export default useExtensionsStore
