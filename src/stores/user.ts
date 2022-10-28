import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { Profile } from "@etherna/api-js"
import type { BatchId, EthAddress, GatewayBatch } from "@etherna/api-js/clients"

export type WalletType = "etherna" | "metamask"

export type UserState = {
  profile: Profile | undefined | null
  address: EthAddress | undefined
  currentWallet?: WalletType | null
  prevAddresses?: string[]
  ens?: string | null
  credit?: number | null
  creditUnlimited?: boolean
  defaultBatchId?: BatchId
  batches: GatewayBatch[]
  isSignedIn?: boolean
  isSignedInGateway?: boolean
}

export type UserActions = {
  setProfile(profile: Profile): void
  setCredit(credit: number | null, unlimited?: boolean): void
  setDefaultBatchId(batchId: BatchId): void
  setBatches(batches: GatewayBatch[]): void
  updateIdentity(address: EthAddress, prevAddresses: EthAddress[], wallet: WalletType): void
  updateSignedIn(isSignedIn: boolean, isSignedInGateway: boolean): void
}

const getInitialState = (): UserState => ({
  address: undefined,
  profile: undefined,
  batches: [],
})

const useUserStore = create<UserState & UserActions>()(
  logger(
    devtools(
      persist(
        immer(set => ({
          ...getInitialState(),
          setCredit(credit, unlimited?) {
            set(state => {
              state.credit = credit
              state.creditUnlimited = unlimited
            })
          },
          setBatches(batches) {
            set(state => {
              state.batches = batches
            })
          },
          setDefaultBatchId(batchId) {
            set(state => {
              state.defaultBatchId = batchId
            })
          },
          setProfile(profile) {
            set(state => {
              state.profile = profile
            })
          },
          updateIdentity(address, prevAddresses, wallet) {
            set(state => {
              state.address = address
              state.prevAddresses = prevAddresses
              state.currentWallet = wallet
            })
          },
          updateSignedIn(isSignedIn, isSignedInGateway) {
            set(state => {
              state.isSignedIn = isSignedIn
              state.isSignedInGateway = isSignedInGateway
            })
          },
        })),
        {
          name: "etherna:user",
          getStorage: () => sessionStorage,
        }
      ),
      {
        name: "user",
      }
    )
  )
)

export default useUserStore
