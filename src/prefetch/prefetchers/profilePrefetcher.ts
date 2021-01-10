import { getProfile, Profile } from "@utils/swarmProfile"
import { nullablePromise } from "@utils/promise"
import { fetchFullVideosInfo, IndexVideoFullMeta } from "@utils/video"
import { store } from "@state/store"
import { WindowPrefetchData } from "typings/window"

const match = /\/profile\/([^/]+)/

const fetch = async () => {
  const { indexClient } = store.getState().env

  const matches = window.location.pathname.match(match)
  if (matches && matches.length >= 2) {
    const address = matches[1]

    const user = await indexClient.users.fetchUser(address)

    const [profile, videos] = await Promise.all([
      nullablePromise(getProfile(user.identityManifest, user.address)),
      nullablePromise(fetchFullVideosInfo(0, 50, false, address)),
    ])

    // set prefetch data
    const windowPrefetch = window as WindowPrefetchData
    windowPrefetch.prefetchData = {}
    windowPrefetch.prefetchData.profile = profile
    windowPrefetch.prefetchData.videos = videos
  }
}

const profilePrefetcher = {
  match,
  fetch,
}

export type ProfilePrefetch = {
  profile?: Profile | null
  videos?: IndexVideoFullMeta[] | null
}

export default profilePrefetcher
