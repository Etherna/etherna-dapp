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
import { useDispatch } from "react-redux"
import type { BatchId, EthAddress, SSOIdentity } from "@etherna/api-js/clients"
import type { AxiosError } from "axios"
import type { Dispatch } from "redux"

import BeeClient from "@/classes/BeeClient"
import SwarmProfile from "@/classes/SwarmProfile"
import loginRedirect from "@/state/actions/user/login-redirect"
import type { EnvActions } from "@/state/reducers/enviromentReducer"
import { EnvActionTypes } from "@/state/reducers/enviromentReducer"
import type { ProfileActions } from "@/state/reducers/profileReducer"
import { ProfileActionTypes } from "@/state/reducers/profileReducer"
import type { UIActions } from "@/state/reducers/uiReducer"
import { UIActionTypes } from "@/state/reducers/uiReducer"
import type { UserActions } from "@/state/reducers/userReducer"
import { UserActionTypes } from "@/state/reducers/userReducer"
import useSelector from "@/state/useSelector"
import { addressBytes, signMessage } from "@/utils/ethereum"

type AutoSigninOpts = {
  forceSignin?: boolean
  service?: "index" | "gateway"
  isStatusPage?: boolean
}

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
      isSignedInGateway: hasCredit,
    })

    if (currentUser && identity) {
      const address = identity.etherAddress as EthAddress
      fetchProfile(address, identity)
    }
  }

  const fetchAuthIdentity = async () => {
    try {
      const identity = await authClient.identity.fetchCurrentIdentity()

      dispatch({
        type: UserActionTypes.USER_UPDATE_IDENTITY,
        address: identity.etherAddress,
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
          isStandalone: true,
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
      const bytePrice = await gatewayClient.system.fetchCurrentBytePrice()

      dispatch({
        type: EnvActionTypes.UPDATE_BYTE_PRICE,
        bytePrice,
      })

      return true
    } catch {
      return false
    }
  }

  const fetchProfile = async (address: EthAddress, identity?: SSOIdentity) => {
    dispatch({
      type: UIActionTypes.TOGGLE_LOADING_PROFILE,
      isLoadingProfile: true,
    })

    // update bee client with signer for feed update
    if (identity?.accountType === "web2") {
      const beeClientSigner = new BeeClient(beeClient.url, {
        signer: identity.etherManagedPrivateKey!,
      })

      dispatch({
        type: EnvActionTypes.UPDATE_BEE_CLIENT,
        beeClient: beeClientSigner,
        signerWallet: "etherna",
      })
    } else if (identity?.accountType === "web3") {
      const beeClientSigner = new BeeClient(beeClient.url, {
        signer: {
          address: address as EthAddress,
          sign: async digest => {
            try {
              return await signMessage(digest, address)
            } catch (error: any) {
              if (error.code === -32602) {
                return await signMessage(digest, address)
              } else {
                throw error
              }
            }
          },
        },
      })

      dispatch({
        type: EnvActionTypes.UPDATE_BEE_CLIENT,
        beeClient: beeClientSigner,
        signerWallet: "metamask",
      })
    }

    try {
      const profileReader = new SwarmProfile.Reader(address, { beeClient })
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

      dispatch({
        type: UserActionTypes.USER_SET_DEFAULT_BATCH_ID,
        batchId: profile.batchId as BatchId,
      })
    } catch (error: any) {
      console.error(error)
    }

    dispatch({
      type: UIActionTypes.TOGGLE_LOADING_PROFILE,
      isLoadingProfile: false,
    })
  }
}
