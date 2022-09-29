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
import type { BatchId, EthAddress, SSOIdentity } from "@etherna/api-js/clients"

import BeeClient from "@/classes/BeeClient"
import SwarmProfile from "@/classes/SwarmProfile"
import useClientsStore from "@/stores/clients"
import useSessionStore from "@/stores/session"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"
import { loginRedirect } from "@/utils/automations"
import { signMessage } from "@/utils/ethereum"

type AutoSigninOpts = {
  forceSignin?: boolean
  service?: "index" | "gateway"
  isStatusPage?: boolean
}

export default function useFetchIdentity(opts: AutoSigninOpts = {}) {
  const indexClient = useClientsStore(state => state.indexClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const ssoClient = useClientsStore(state => state.ssoClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const updateBeeClient = useClientsStore(state => state.updateBeeClient)
  const setBytesPrice = useSessionStore(state => state.setBytesPrice)
  const setCredit = useUserStore(state => state.setCredit)
  const setDefaultBatchId = useUserStore(state => state.setDefaultBatchId)
  const setBatches = useUserStore(state => state.setBatches)
  const setProfile = useUserStore(state => state.setProfile)
  const updateIdentity = useUserStore(state => state.updateIdentity)
  const updateSignedIn = useUserStore(state => state.updateSignedIn)
  const toggleProfileLoading = useUIStore(state => state.toggleProfileLoading)

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

    const isSignedIn = !!currentUser
    const isSignedInGateway = hasCredit

    updateSignedIn(isSignedIn, isSignedInGateway)

    if (currentUser && identity) {
      const address = identity.etherAddress as EthAddress
      await fetchProfile(address, identity)
    }

    toggleProfileLoading(false)
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
      const profile = await profileReader.download()

      if (!profile) throw new Error("Cannot fetch profile")

      setProfile(profile)
      setDefaultBatchId(profile.batchId as BatchId)
    } catch (error: any) {
      console.error(error)
    }
  }
}
