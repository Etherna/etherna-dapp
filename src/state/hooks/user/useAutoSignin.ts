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

import { useEffect } from "react"
import { Dispatch } from "redux"
import { useDispatch } from "react-redux"
import type { EthAddress } from "@ethersphere/bee-js/dist/src/utils/eth"
import type { AxiosError } from "axios"

import SwarmProfileIO from "@classes/SwarmProfile"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import loginRedirect from "@state/actions/user/login-redirect"
import { UserActions, UserActionTypes } from "@state/reducers/userReducer"
import { EnvActions, EnvActionTypes } from "@state/reducers/enviromentReducer"
import { ProfileActions, ProfileActionTypes } from "@state/reducers/profileReducer"
import { UIActions, UIActionTypes } from "@state/reducers/uiReducer"
import useSelector from "@state/useSelector"
import { addressBytes, signMessage } from "@utils/ethereum"
import type { AuthIdentity } from "@definitions/api-sso"
import type { GatewayBatch, GatewayBatchPreview } from "@definitions/api-gateway"

type AutoSigninOpts = {
  forceSignin?: boolean
  service?: "index" | "gateway"
  isStatusPage?: boolean
}

let batchesFetchTries = 0

export default function useAutoSignin(opts: AutoSigninOpts = {}) {
  const { indexClient, gatewayClient, authClient, beeClient } = useSelector(state => state.env)
  const dispatch = useDispatch<Dispatch<UserActions | EnvActions | UIActions | ProfileActions>>()

  useEffect(() => {
    // status page doesn't need current user info
    if (opts.isStatusPage) return

    if (opts.forceSignin) {
      // Launch login
      loginRedirect(opts.service)
    } else {
      // fetch signed in user with profile info
      fetchIdentity()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchIdentity = async () => {
    const [identityResult, currentUserResult, hasCreditResult] = await Promise.allSettled([
      fetchAuthIdentity(),
      fetchIndexCurrentUser(),
      fetchCurrentUserCredit(),
      fetchCurrentBytePrice(),
    ])

    const identity = identityResult.status === "fulfilled" && identityResult.value
    const currentUser = currentUserResult.status === "fulfilled" && currentUserResult.value
    const hasCredit = hasCreditResult.status === "fulfilled" && hasCreditResult.value

    dispatch({
      type: UserActionTypes.USER_UPDATE_SIGNEDIN,
      isSignedIn: !!currentUser,
      isSignedInGateway: hasCredit
    })

    if (currentUser && identity) {
      const address = identity.etherLoginAddress || identity.etherAddress
      fetchProfile(address, identity)
    }
    if (hasCredit) {
      fetchBatches()
    }
  }

  const fetchAuthIdentity = async () => {
    try {
      const identity = await authClient.identity.fetchCurrentIdentity()

      dispatch({
        type: UserActionTypes.USER_UPDATE_IDENTITY,
        address: identity.etherLoginAddress || identity.etherAddress,
        prevAddresses: identity.etherPreviousAddresses,
      })

      return identity
    } catch {
      return undefined
    }
  }

  const fetchIndexCurrentUser = async () => {
    try {
      const profile = await indexClient.users.fetchCurrentUser()
      return profile
    } catch {
      return false
    }
  }

  const fetchCurrentUserCredit = async () => {
    try {
      const { balance, isUnlimited } = await gatewayClient.users.fetchCredit()

      dispatch({
        type: UserActionTypes.USER_UPDATE_CREDIT,
        credit: balance,
        creditUnlimited: isUnlimited,
      })

      return true
    } catch (error: any) {
      const status = (error as AxiosError).response?.status

      if (status === 404) {
        dispatch({
          type: EnvActionTypes.SET_IS_STANDALONE_GATEWAY,
          isStandalone: true
        })
      }

      dispatch({
        type: UserActionTypes.USER_UPDATE_CREDIT,
        credit: null,
        creditUnlimited: false,
      })

      return false
    }
  }

  const fetchCurrentBytePrice = async () => {
    try {
      const bytePrice = await gatewayClient.settings.fetchCurrentBytePrice()

      dispatch({
        type: EnvActionTypes.UPDATE_BYTE_PRICE,
        bytePrice,
      })

      return true
    } catch {
      return false
    }
  }

  const fetchProfile = async (address: string, identity?: AuthIdentity) => {
    dispatch({
      type: UIActionTypes.TOGGLE_LOADING_PROFILE,
      isLoadingProfile: true,
    })

    // update bee client with signer for feed update
    if (identity?.etherManagedPrivateKey) {
      const beeClientSigner = new SwarmBeeClient(beeClient.url, {
        signer: identity.etherManagedPrivateKey
      })

      dispatch({
        type: EnvActionTypes.UPDATE_BEE_CLIENT,
        beeClient: beeClientSigner,
        signerWallet: "etherna"
      })
    } else if (window.ethereum && window.ethereum.request) {
      const beeClientSigner = new SwarmBeeClient(beeClient.url, {
        signer: {
          address: addressBytes(address) as EthAddress,
          sign: async (digest) => {
            try {
              return await signMessage(digest.hex().toString(), address)
            } catch (error: any) {
              if (error.code === -32602) {
                return await signMessage(digest.hex().toString(), address)
              } else {
                throw error
              }
            }
          }
        }
      })

      dispatch({
        type: EnvActionTypes.UPDATE_BEE_CLIENT,
        beeClient: beeClientSigner,
        signerWallet: "metamask"
      })
    }

    try {
      const profileReader = new SwarmProfileIO.Reader(address, { beeClient })
      const profile = await profileReader.download()

      if (!profile) throw new Error("Cannot fetch profile")

      dispatch({
        type: ProfileActionTypes.PROFILE_UPDATE,
        name: profile.name || "",
        description: profile.description || "",
        avatar: profile.avatar,
        cover: profile.cover,
        location: profile.location,
        website: profile.website,
        birthday: profile.birthday,
        existsOnIndex: true,
      })
    } catch (error: any) {
      console.error(error)
    }

    dispatch({
      type: UIActionTypes.TOGGLE_LOADING_PROFILE,
      isLoadingProfile: false,
    })
  }

  const fetchBatches = async () => {
    batchesFetchTries++

    let userBatches: GatewayBatch[] = []
    let batchesPreview: GatewayBatchPreview[] = []

    try {
      batchesPreview = await gatewayClient.users.fetchBatches()

      if (batchesPreview.length === 0) {
        // waiting to auto create default batch
        console.warn("Still no batches. Re-Trying in 10 seconds.")
        batchesFetchTries < 5 && setTimeout(() => {
          fetchBatches()
        }, 10000)

        return
      }

      userBatches = await Promise.all(
        batchesPreview.map(batchPreview => gatewayClient.users.fetchBatch(batchPreview.batchId))
      )
    } catch (error) {
      if (import.meta.env.DEV) {
        // In local execution return the initial batch id
        const batches = await beeClient.getAllPostageBatch()
        const usableBatches = batches.filter(batch => batch.usable)
        userBatches = usableBatches.map(batch => ({
          id: batch.batchID,
          depth: batch.depth,
          bucketDepth: batch.bucketDepth,
          amountPaid: +batch.amount,
          normalisedBalance: 0,
          batchTTL: -1,
          usable: batch.usable,
          utilization: batch.utilization,
          blockNumber: batch.blockNumber,
          exists: true,
          immutableFlag: batch.immutableFlag,
          label: batch.label,
          ownerAddress: null,
        }))
      } else {
        userBatches = batchesPreview.map(batchPreview => ({
          id: batchPreview.batchId,
          depth: 20,
          bucketDepth: 0,
          amountPaid: 0,
          normalisedBalance: 0,
          batchTTL: 0,
          usable: false,
          utilization: 0,
          blockNumber: 0,
          exists: false,
          immutableFlag: false,
          label: "",
          ownerAddress: null,
        }))
      }
    }

    dispatch({
      type: EnvActionTypes.UPDATE_BEE_CLIENT_BATCHES,
      batches: userBatches,
    })

    dispatch({
      type: UserActionTypes.USER_SET_BATCHES,
      batches: userBatches,
    })
  }
}
