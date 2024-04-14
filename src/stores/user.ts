import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { ProfileWithEns } from "@etherna/sdk-js"
import type { BatchId, EthAddress, GatewayBatch } from "@etherna/sdk-js/clients"
import type { Draft } from "immer"

export type WalletType = "etherna" | "metamask"

export type UserState = {
  profile: ProfileWithEns | undefined | null
  address: EthAddress | undefined
  currentWallet?: WalletType | null
  prevAddresses?: string[]
  ens?: string | null
  credit?: number | null
  creditUnlimited?: boolean
  defaultBatch?: GatewayBatch
  defaultBatchId?: BatchId
  batches: GatewayBatch[]
  isSignedInIndex?: boolean
  isSignedInGateway?: boolean
  isFreePostageBatchConsumed?: boolean
  needsFunds: boolean
}

const getInitialState = (): UserState => ({
  address: undefined,
  profile: undefined,
  batches: [],
  needsFunds: false,
})

type SetFunc = (setFunc: (state: Draft<UserState>) => void) => void
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
      state.needsFunds = (!credit || credit <= 0) && !unlimited
    })
  },
  setBatches(batches: GatewayBatch[]) {
    set(state => {
      state.batches = batches
    })
  },
  setDefaultBatch(batch: GatewayBatch | undefined) {
    set(state => {
      state.defaultBatch = batch
      state.defaultBatchId = batch?.id
      state.batches = batch
        ? [batch, ...state.batches.filter(b => b.id !== batch.id)]
        : state.batches
    })
  },
  setProfile(profile: ProfileWithEns) {
    set(state => {
      state.profile = profile
      state.ens = profile.ens
    })
  },
  setFreePostageBatchConsumed(isFreePostageBatchConsumed: boolean) {
    set(state => {
      state.isFreePostageBatchConsumed = isFreePostageBatchConsumed
    })
  },
  updateIdentity(address: EthAddress, prevAddresses: EthAddress[], wallet: WalletType) {
    set(state => {
      state.address = address
      state.prevAddresses = prevAddresses
      state.currentWallet = wallet
    })
  },
  updateSignedIn(isSignedInIndex: boolean, isSignedInGateway: boolean) {
    set(state => {
      state.isSignedInIndex = isSignedInIndex
      state.isSignedInGateway = isSignedInGateway
      state.needsFunds = !isSignedInGateway
    })
  },
  signout() {
    set(state => {
      state.address = undefined
      state.profile = undefined
      state.prevAddresses = undefined
      state.currentWallet = undefined
      state.ens = undefined
      state.credit = undefined
      state.creditUnlimited = undefined
      state.defaultBatch = undefined
      state.defaultBatchId = undefined
      state.batches = []
      state.isSignedInIndex = false
      state.isSignedInGateway = false
      state.isFreePostageBatchConsumed = false
      state.needsFunds = true
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
          storage: createJSONStorage(() => sessionStorage),
        }
      ),
      {
        name: "user",
      }
    )
  )
)

export default useUserStore
