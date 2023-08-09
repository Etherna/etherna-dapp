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

import SwarmProfile from "@/classes/SwarmProfile"
import useClientsStore from "@/stores/clients"
import { wait } from "@/utils/promise"

import type { Profile } from "@etherna/sdk-js"
import type { EthAddress } from "@etherna/sdk-js/clients"

type SwarmProfileOptions = {
  address: EthAddress
  prefetchedProfile?: Profile
}

export default function useSwarmProfile(opts: SwarmProfileOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const [profile, setProfile] = useState<Profile | null>(opts.prefetchedProfile ?? null)
  const [isLoading, setIsloading] = useState(false)

  // Returns
  const loadProfile = useCallback(async () => {
    setIsloading(true)

    const profileReader = new SwarmProfile.Reader(opts.address, {
      beeClient,
    })

    let profile: Profile = profileReader.emptyProfile()

    try {
      const profileInfo = await profileReader.download()
      import.meta.env.DEV && (await wait(1000))

      if (profileInfo) {
        profile = profileInfo
      }
    } catch (error) {
      console.error(error)
    }

    setProfile(profile)
    setIsloading(false)

    return profile
  }, [beeClient, opts.address])

  const updateProfile = useCallback(
    async (profile: Profile) => {
      setIsloading(true)

      // save profile data on swarm
      try {
        const profileWriter = new SwarmProfile.Writer(profile, { beeClient })
        const newReference = await profileWriter.upload()
        return newReference
      } catch (error) {
        console.error(error)
      } finally {
        setIsloading(false)
      }
      return null
    },
    [beeClient]
  )

  return {
    profile,
    isLoading,
    loadProfile,
    updateProfile,
  }
}
