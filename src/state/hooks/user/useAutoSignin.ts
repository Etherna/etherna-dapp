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

import { AuthIdentity } from "@classes/EthernaAuthClient/types"
import SwarmProfile from "@classes/SwarmProfile"
import loginRedirect from "@state/actions/user/loginRedirect"
import { UserActions, UserActionTypes } from "@state/reducers/userReducer"
import { EnvActions, EnvActionTypes } from "@state/reducers/enviromentReducer"
import { ProfileActions, ProfileActionTypes } from "@state/reducers/profileReducer"
import { UIActions, UIActionTypes } from "@state/reducers/uiReducer"
import useSelector from "@state/useSelector"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { IndexCurrentUser } from "@classes/EthernaIndexClient/types"

type AutoSigninOpts = {
  forceSignin?: boolean
  service?: "index" | "gateway"
  isStatusPage?: boolean
}

const useAutoSignin = (opts: AutoSigninOpts = {}) => {
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
    const [identity, currentUser, hasCredit] = await Promise.all([
      fetchAuthIdentity(),
      fetchIndexCurrentUser(),
      fetchCurrentUserCredit(),
      fetchCurrentBytePrice(),
    ])

    dispatch({
      type: UserActionTypes.USER_UPDATE_SIGNEDIN,
      isSignedIn: !!currentUser,
      isSignedInGateway: hasCredit
    })

    if (currentUser) {
      await fetchProfile(currentUser, identity)
    }
  }

  const fetchAuthIdentity = async () => {
    try {
      const identity = await authClient.identity.fetchCurrentIdentity()
      return identity
    } catch {
      return undefined
    }
  }

  const fetchIndexCurrentUser = async () => {
    try {
      const profile = await indexClient.users.fetchCurrentUser()

      dispatch({
        type: UserActionTypes.USER_UPDATE_IDENTITY,
        address: profile.address,
        manifest: profile.identityManifest,
        prevAddresses: profile.prevAddresses,
      })

      return profile
    } catch {
      return false
    }
  }

  const fetchCurrentUserCredit = async () => {
    try {
      const credit = await gatewayClient.users.fetchCredit()

      dispatch({
        type: UserActionTypes.USER_UPDATE_CREDIT,
        credit,
      })

      return true
    } catch {
      dispatch({
        type: UserActionTypes.USER_UPDATE_CREDIT,
        credit: 0,
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

  const fetchProfile = async (user: IndexCurrentUser, identity?: AuthIdentity) => {
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
        beeClient: beeClientSigner
      })
    }

    try {
      const address = user.address
      const hash = user.identityManifest
      const profile = await (new SwarmProfile({ beeClient, address, hash })).downloadProfile()

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
}

export default useAutoSignin
