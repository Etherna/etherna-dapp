import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { Profile } from "@etherna/api-js"
import type { BatchId, EthAddress, GatewayBatch } from "@etherna/api-js/clients"
import type { WritableDraft } from "immer/dist/internal"

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

const getInitialState = (): UserState => ({
  address: undefined,
  profile: undefined,
  batches: [],
})

type SetFunc = (setFunc: (state: WritableDraft<UserState>) => void) => void
type GetFunc = () => UserState

const actions = (set: SetFunc, get: GetFunc) => ({
  addBatches(batches: GatewayBatch[]) {
    set(state => {
      state.batches = [
        ...state.batches,
        ...batches.filter(batch => !state.batches.find(stateBatch => stateBatch.id === batch.id)),
      ]
    })
  },
  getBatchNumber(batchId: BatchId) {
    return get().batches.findIndex(batch => batch.id === batchId) + 1
  },
  setCredit(credit: number | null, unlimited?: boolean) {
    set(state => {
      state.credit = credit
      state.creditUnlimited = unlimited
    })
  },
  setBatches(batches: GatewayBatch[]) {
    set(state => {
      state.batches = batches
    })
  },
  setDefaultBatchId(batchId: BatchId) {
    set(state => {
      state.defaultBatchId = batchId
    })
  },
  setProfile(profile: Profile) {
    set(state => {
      state.profile = profile
    })
  },
  updateIdentity(address: EthAddress, prevAddresses: EthAddress[], wallet: WalletType) {
    set(state => {
      state.address = address
      state.prevAddresses = prevAddresses
      state.currentWallet = wallet
    })
  },
  updateSignedIn(isSignedIn: boolean, isSignedInGateway: boolean) {
    set(state => {
      state.isSignedIn = isSignedIn
      state.isSignedInGateway = isSignedInGateway
    })
  },
})

const useUserStore = create<UserState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          ...actions(set, get),
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
