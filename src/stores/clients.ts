import create from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import BeeClient from "@/classes/BeeClient"
import GatewayClient from "@/classes/GatewayClient"
import IndexClient from "@/classes/IndexClient"
import SSOClient from "@/classes/SSOClient"

import type { WritableDraft } from "immer/dist/internal"

export type ClientsState = {
  beeClient: BeeClient
  indexClient: IndexClient
  gatewayClient: GatewayClient
  ssoClient: SSOClient
}

const getInitialState = (): ClientsState => ({
  indexClient: IndexClient.fromExtensions(),
  gatewayClient: GatewayClient.fromExtensions(),
  ssoClient: new SSOClient(import.meta.env.VITE_APP_SSO_URL),
  beeClient: new BeeClient(GatewayClient.defaultUrl()),
})

type SetFunc = (setFunc: (state: WritableDraft<ClientsState>) => void) => void
type GetFunc = () => ClientsState

const actions = (set: SetFunc, get: GetFunc) => ({
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
})

const useClientsStore = create<ClientsState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      immer((set, get) => ({
        ...getInitialState(),
        ...actions(set, get),
      })),
      {
        name: "clients",
      }
    )
  )
)

export default useClientsStore
