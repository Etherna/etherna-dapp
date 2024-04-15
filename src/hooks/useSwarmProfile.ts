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

import { useCallback, useState } from "react"
import { ProfileBuilder } from "@etherna/sdk-js/swarm"
import {
  bytesReferenceToReference,
  fetchAddressFromEns,
  isEnsAddress,
  ZeroHashReference,
} from "@etherna/sdk-js/utils"

import useErrorMessage from "./useErrorMessage"
import SwarmProfile from "@/classes/SwarmProfile"
import useClientsStore from "@/stores/clients"
import { wait } from "@/utils/promise"

import type { ProfileWithEns } from "@etherna/sdk-js"
import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"
import type { ProfileDownloadMode } from "@etherna/sdk-js/swarm"

type SwarmProfileOptions = {
  mode: ProfileDownloadMode
  address: EthAddress | EnsAddress
  prefetchedProfile?: ProfileWithEns
}

export default function useSwarmProfile(opts: SwarmProfileOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const [profile, setProfile] = useState<ProfileWithEns | null>(opts.prefetchedProfile ?? null)
  const [isLoading, setIsloading] = useState(false)
  const [builder, setBuilder] = useState<ProfileBuilder>(new ProfileBuilder())
  const { showError } = useErrorMessage()

  // Returns
  const loadProfile = useCallback(async () => {
    setIsloading(true)

    const profileReader = new SwarmProfile.Reader(opts.address, {
      beeClient,
    })

    let profile: ProfileWithEns | null = null

    try {
      const profileInfo = await profileReader.download({
        mode: opts.mode,
      })
      import.meta.env.DEV && (await wait(1000))

      if (profileInfo) {
        profile = profileInfo
      }
    } catch (error) {
      console.error(error)
    }

    if (!profile) {
      // now empty profile might have fetched ENS name
      profile = profileReader.emptyProfile(bytesReferenceToReference(ZeroHashReference))
    }

    setProfile(profile)
    setIsloading(false)

    return profile
  }, [beeClient, opts.address, opts.mode])

  const updateProfile = useCallback(
    async (builder: ProfileBuilder) => {
      setIsloading(true)

      // save profile data on swarm
      try {
        const address = isEnsAddress(opts.address)
          ? await fetchAddressFromEns(opts.address)
          : opts.address

        if (!address) {
          throw new Error("ENS address not found")
        }

        const profileWriter = new SwarmProfile.Writer(builder, { beeClient })
        const newReference = await profileWriter.upload()
        return newReference
      } catch (error) {
        showError("Failed to update profile", (error as Error).message)
        console.error(error)
      } finally {
        setIsloading(false)
      }
      return null
    },
    [beeClient, opts.address, showError]
  )

  return {
    profile,
    builder,
    isLoading,
    loadProfile,
    updateProfile,
  }
}
