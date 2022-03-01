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

import { useEffect, useState } from "react"

import SwarmProfileIO, { getDefaultProfile } from "@classes/SwarmProfile"
import useSelector from "@state/useSelector"
import type { Profile } from "@definitions/swarm-profile"
import { wait } from "@utils/promise"

type SwarmProfileOptions = {
  address: string
  fetchFromCache?: boolean
  updateCache?: boolean
}

export default function useSwarmProfile(opts: SwarmProfileOptions) {
  const { fetchFromCache, updateCache } = opts

  const { beeClient, indexClient } = useSelector(state => state.env)
  const [address, setAddress] = useState(opts.address)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsloading] = useState(false)

  useEffect(() => {
    if (address !== opts.address) {
      setAddress(opts.address)
    }
  }, [address, opts.address])

  // Returns
  const loadProfile = async () => {
    setIsloading(true)

    const profileReader = new SwarmProfileIO.Reader(address, {
      beeClient,
      fetchFromCache,
      updateCache,
    })

    let profile = getDefaultProfile(address)

    try {
      const profileInfo = await profileReader.download()
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

    const profileWriter = new SwarmProfileIO.Writer(address, { beeClient })

    // save profile data on swarm
    console.log("saving....")
    const newReference = await profileWriter.update(profile)
    console.log("new ref", newReference)

    // update index
    await indexClient.users.updateCurrentUser(newReference)

    console.log("index updated")


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
