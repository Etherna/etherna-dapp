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

import { useState } from "react"

import SwarmProfileIO from "@/classes/SwarmProfile"
import useSelector from "@/state/useSelector"
import { wait } from "@/utils/promise"
import type { Profile } from "@/definitions/swarm-profile"

type SwarmProfileOptions = {
  address: string
  fetchFromCache?: boolean
  updateCache?: boolean
}

export default function useSwarmProfile(opts: SwarmProfileOptions) {
  const { fetchFromCache, updateCache } = opts

  const { beeClient } = useSelector(state => state.env)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsloading] = useState(false)

  // Returns
  const loadProfile = async () => {
    setIsloading(true)

    const profileReader = new SwarmProfileIO.Reader(opts.address, {
      beeClient,
      fetchFromCache,
      updateCache,
    })

    let profile = SwarmProfileIO.getDefaultProfile(opts.address)

    try {
      const profileInfo = await profileReader.download(true)
      import.meta.env.DEV && await wait(1000)

      if (profileInfo) {
        profile = profileInfo
      }
    } catch (error) {
      console.error(error)
    }

    setProfile(profile)
    setIsloading(false)

    return profile
  }

  const updateProfile = async (profile: Profile) => {
    setIsloading(true)

    const profileWriter = new SwarmProfileIO.Writer(opts.address, { beeClient })

    // save profile data on swarm
    const newReference = await profileWriter.update(profile)

    setIsloading(false)

    return newReference
  }

  return {
    profile,
    isLoading,
    loadProfile,
    updateProfile
  }
}
