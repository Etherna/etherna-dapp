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

import { useEffect, useRef } from "react"
import { useAuth } from "react-oidc-context"

import BeeClient from "@/classes/BeeClient"
import SwarmProfile from "@/classes/SwarmProfile"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useSessionStore from "@/stores/session"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"
import { signMessage } from "@/utils/ethereum"

import type { EthAddress, SSOIdentity } from "@etherna/sdk-js/clients"

type AutoSigninOpts = {}

export default function useFetchIdentity(opts: AutoSigninOpts = {}) {
  const auth = useAuth()
  const fetched = useRef(false)
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const indexClient = useClientsStore(state => state.indexClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const ssoClient = useClientsStore(state => state.ssoClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const updateBeeClient = useClientsStore(state => state.updateBeeClient)
  const setBytesPrice = useSessionStore(state => state.setBytesPrice)
  const setFreePostageBatchConsumed = useUserStore(state => state.setFreePostageBatchConsumed)
  const setCredit = useUserStore(state => state.setCredit)
  const setProfile = useUserStore(state => state.setProfile)
  const updateIdentity = useUserStore(state => state.updateIdentity)
  const updateSignedIn = useUserStore(state => state.updateSignedIn)
  const toggleProfileLoading = useUIStore(state => state.toggleProfileLoading)

  useEffect(() => {
    if (fetched.current) return
    if (!auth.isLoading) {
      fetched.current = true

      indexClient.accessToken = auth.user?.access_token
      gatewayClient.accessToken = auth.user?.access_token
      ssoClient.accessToken = auth.user?.access_token

      fetchIdentity()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isLoading, auth.user])

  const fetchIdentity = async () => {
    if (!auth.user) {
      updateSignedIn(false, false)
      setCredit(null, false)

      return
    }

    toggleProfileLoading(true)

    const [identityResult, currentUserResult, hasCreditResult] = await Promise.allSettled([
      fetchAuthIdentity(),
      fetchIndexCurrentUser(),
      fetchCurrentUserCredit(),
      fetchCurrentBytePrice(),
    ])

    const identity = identityResult.status === "fulfilled" && identityResult.value
    const currentUser = currentUserResult.status === "fulfilled" && currentUserResult.value
    const hasCredit = hasCreditResult.status === "fulfilled" && hasCreditResult.value

    const isSignedInIndex = !!currentUser
    const isSignedInGateway = hasCredit

    updateSignedIn(isSignedInIndex, isSignedInGateway)

    if (currentUser && identity) {
      const address = identity.etherAddress as EthAddress
      await fetchProfile(address, identity)
    }

    toggleProfileLoading(false)

    // send asynchronusly welcome postage request
    requestWelcomePostage()
  }

  const fetchAuthIdentity = async () => {
    try {
      const identity = await ssoClient.identity.fetchCurrentIdentity()

      const address = identity.etherAddress
      const prevAddresses = identity.etherPreviousAddresses as EthAddress[]

      updateIdentity(
        address,
        prevAddresses,
        identity.accountType === "web3" ? "metamask" : "etherna"
      )

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
      setCredit(balance, isUnlimited)

      return true
    } catch (error: any) {
      setCredit(null, false)

      return false
    }
  }

  const fetchCurrentBytePrice = async () => {
    try {
      const bytePrice = await gatewayClient.system.fetchCurrentBytePrice()
      setBytesPrice(bytePrice)

      return true
    } catch {
      return false
    }
  }

  const fetchProfile = async (address: EthAddress, identity?: SSOIdentity) => {
    // update bee client with signer for feed update
    if (identity?.accountType === "web2") {
      const beeClientSigner = new BeeClient(beeClient.url, {
        signer: identity.etherManagedPrivateKey!,
      })
      updateBeeClient(beeClientSigner)
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
      updateBeeClient(beeClientSigner)
    }

    try {
      const profileReader = new SwarmProfile.Reader(address, { beeClient })
      const profile = await profileReader.download({
        mode: "preview",
      })

      if (!profile) throw new Error("Cannot fetch profile")

      setProfile(profile.preview, profile.ens)
    } catch (error: any) {
      console.error(error)
    }
  }

  const requestWelcomePostage = async () => {
    if (gatewayType === "bee") return

    try {
      const { isFreePostageBatchConsumed } = await gatewayClient.users.fetchWelcome()

      setFreePostageBatchConsumed(isFreePostageBatchConsumed)

      if (isFreePostageBatchConsumed) return

      console.info("Requesting welcome postage")
      await gatewayClient.users.requestWelcomePostage()
      console.info("Welcome postage requested")

      setFreePostageBatchConsumed(true)
    } catch (error: any) {}
  }
}
