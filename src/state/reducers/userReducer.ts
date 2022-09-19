/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import type { BatchId, EthAddress, GatewayBatch } from "@etherna/api-js/clients"

import type { UserState } from "@/types/app-state"

export const UserActionTypes = {
  USER_ENS_UPDATE: "USER_ENS_UPDATE",
  USER_SIGNOUT: "USER_SIGNOUT",
  USER_UPDATE_IDENTITY: "USER_UPDATE_IDENTITY",
  USER_UPDATE_CREDIT: "USER_UPDATE_CREDIT",
  USER_UPDATE_SIGNEDIN: "USER_UPDATE_SIGNEDIN",
  USER_SET_DEFAULT_BATCH_ID: "USER_SET_DEFAULT_BATCH_ID",
  USER_SET_DEFAULT_BATCH: "USER_SET_DEFAULT_BATCH",
  USER_SET_BATCHES: "USER_SET_BATCHES",
} as const

// Export dispatch actions
type UpdateEnsAction = {
  type: typeof UserActionTypes.USER_ENS_UPDATE
  ens: string | null | undefined
}
type UserSignoutAction = {
  type: typeof UserActionTypes.USER_SIGNOUT
}
type UpdateIdentityAction = {
  type: typeof UserActionTypes.USER_UPDATE_IDENTITY
  address?: EthAddress
  prevAddresses?: string[]
}
type UpdateCreditAction = {
  type: typeof UserActionTypes.USER_UPDATE_CREDIT
  credit: number | null
  creditUnlimited: boolean
}
type UpdateSignedInAction = {
  type: typeof UserActionTypes.USER_UPDATE_SIGNEDIN
  isSignedIn: boolean
  isSignedInGateway: boolean
}
type SetDefaultBatchIdAction = {
  type: typeof UserActionTypes.USER_SET_DEFAULT_BATCH_ID
  batchId: BatchId | undefined
}
type SetDefaultBatcheAction = {
  type: typeof UserActionTypes.USER_SET_DEFAULT_BATCH
  batch: GatewayBatch | undefined
}
type SetBatchesAction = {
  type: typeof UserActionTypes.USER_SET_BATCHES
  batches: GatewayBatch[]
}

export type UserActions =
  | UpdateEnsAction
  | UserSignoutAction
  | UpdateIdentityAction
  | UpdateCreditAction
  | UpdateSignedInAction
  | SetDefaultBatchIdAction
  | SetDefaultBatcheAction
  | SetBatchesAction

// Init reducer
const userReducer = (state: UserState = {}, action: UserActions): UserState => {
  switch (action.type) {
    case UserActionTypes.USER_ENS_UPDATE:
      return {
        ...state,
        ens: action.ens,
      }

    case UserActionTypes.USER_SIGNOUT:
      return {
        isSignedIn: false,
      }

    case UserActionTypes.USER_UPDATE_IDENTITY:
      return {
        ...state,
        address: action.address,
        prevAddresses: action.prevAddresses,
      }

    case UserActionTypes.USER_UPDATE_CREDIT:
      return {
        ...state,
        credit: action.credit,
        creditUnlimited: action.creditUnlimited,
      }

    case UserActionTypes.USER_UPDATE_SIGNEDIN:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
        isSignedInGateway: action.isSignedInGateway,
      }

    case UserActionTypes.USER_SET_DEFAULT_BATCH_ID:
      return {
        ...state,
        defaultBatchId: action.batchId,
      }

    case UserActionTypes.USER_SET_DEFAULT_BATCH:
      return {
        ...state,
        defaultBatch: action.batch,
      }

    case UserActionTypes.USER_SET_BATCHES:
      return {
        ...state,
        batches: action.batches,
      }

    default:
      return state
  }
}

export default userReducer
