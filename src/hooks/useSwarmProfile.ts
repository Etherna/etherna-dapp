import { useCallback, useEffect, useState } from "react"

import SwarmProfile from "@classes/SwarmProfile"
import { Profile } from "@classes/SwarmProfile/types"
import useSelector from "@state/useSelector"

type SwarmProfileOptions = {
  address: string
  hash?: string
  fetchFromCache?: boolean
  updateCache?: boolean
}

type UseProfile = [
  /** Profile object */
  profile: Profile,
  /** Download profile info */
  load: () => Promise<Profile|undefined>,
  /** Update profile */
  update: (profile: Profile) => Promise<string>
]

const useSwarmProfile = (opts: SwarmProfileOptions): UseProfile => {
  const [address, setAddress] = useState(opts.address)
  const [profileHandler, setProfileHandler] = useState<SwarmProfile>()
  const { beeClient, indexClient } = useSelector(state => state.env)

  useEffect(() => {
    if (address !== opts.address) {
      setAddress(opts.address)
    }
  }, [address, opts.address])

  useEffect(() => {
    const { hash, fetchFromCache, updateCache } = opts
    if (beeClient) {
      setProfileHandler(new SwarmProfile({ address, hash, fetchFromCache, updateCache, beeClient }))
    }
  }, [beeClient, address, opts])


  // Returns
  const profile = profileHandler?.profile ?? SwarmProfile.defaultProfile(address)

  const load = useCallback(async () => {
    if (!profileHandler) return

    if (!opts.hash && !profileHandler.loadedFromPrefetch) {
      // fetch hash if missing
      const user = await indexClient.users.fetchUser(address)
      profileHandler.hash = user.identityManifest
    }
    return profileHandler.downloadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileHandler])

  const update = useCallback(async (profile: Profile) => {
    return profileHandler!.updateProfile(profile)
  }, [profileHandler])

  return [profile, load, update]
}

export default useSwarmProfile
