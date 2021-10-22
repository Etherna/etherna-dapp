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

import SwarmProfile from "@classes/SwarmProfile"
import { Profile } from "@classes/SwarmProfile/types"
import useSelector from "@state/useSelector"

type SwarmProfileOptions = {
  address: string
  hash?: string
  fetchFromCache?: boolean
  updateCache?: boolean
}

type UseProfile = {
  /** Profile object */
  profile: Profile,
  /** Download profile info */
  loadProfile: () => Promise<Profile | undefined>,
  /** Update profile */
  updateProfile: (profile: Profile) => Promise<string>
}

const useSwarmProfile = (opts: SwarmProfileOptions): UseProfile => {
  const { hash, fetchFromCache, updateCache } = opts

  const { beeClient, indexClient } = useSelector(state => state.env)
  const [address, setAddress] = useState(opts.address)
  const [profile, setProfile] = useState(SwarmProfile.defaultProfile(opts.address))
  const [profileHandler, setProfileHandler] = useState<SwarmProfile>(
    new SwarmProfile({
      address,
      beeClient,
      hash,
      fetchFromCache,
      updateCache,
    })
  )

  useEffect(() => {
    if (address !== opts.address) {
      setAddress(opts.address)
    }
  }, [address, opts.address])

  useEffect(() => {
    if (beeClient && profileHandler.address !== address) {
      const { hash, fetchFromCache, updateCache } = opts

      setProfileHandler(
        new SwarmProfile({
          address,
          hash,
          fetchFromCache,
          updateCache,
          beeClient
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beeClient, address])


  // Returns
  const loadProfile = async () => {
    if (!opts.hash && !profileHandler.loadedFromPrefetch) {
      // fetch hash if missing
      const user = await indexClient.users.fetchUser(address)
      profileHandler.hash = user.identityManifest
    }

    const profile = await profileHandler.downloadProfile()
    setProfile(profile)

    return profile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  const updateProfile = async (profile: Profile) => {
    // save profile data on swarm
    const newReference = await profileHandler.updateProfile(profile)

    // update index
    await indexClient.users.updateCurrentUser(newReference)

    return newReference
  }

  return {
    profile,
    loadProfile,
    updateProfile
  }
}

export default useSwarmProfile
