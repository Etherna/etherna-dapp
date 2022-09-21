import create from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import BeeClient from "@/classes/BeeClient"
import GatewayClient from "@/classes/GatewayClient"
import IndexClient from "@/classes/IndexClient"
import SSOClient from "@/classes/SSOClient"

export type ClientsState = {
  beeClient: BeeClient
  indexClient: IndexClient
  gatewayClient: GatewayClient
  ssoClient: SSOClient
}

export type ClientsActions = {
  updateIndexClient: (client: IndexClient) => void
  updateGatewayClient: (client: GatewayClient) => void
  updateBeeClient: (client: BeeClient) => void
}

const getInitialState = (): ClientsState => ({
  indexClient: IndexClient.fromExtensions(),
  gatewayClient: GatewayClient.fromExtensions(),
  ssoClient: new SSOClient(import.meta.env.VITE_APP_SSO_URL),
  beeClient: new BeeClient(GatewayClient.defaultUrl()),
})

const useClientsStore = create<ClientsState & ClientsActions>()(
  logger(
    devtools(
      immer(set => ({
        ...getInitialState(),
        updateIndexClient: (client: IndexClient) => {
          set(state => {
            state.indexClient = client
          })
        },
        updateGatewayClient: (client: GatewayClient) => {
          set(state => {
            state.gatewayClient = client
          })
        },
        updateBeeClient: (client: BeeClient) => {
          set(state => {
            state.beeClient = client
          })
        },
      }))
    )
  )
)

export default useClientsStore
