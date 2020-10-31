import { getProfile } from "@utils/swarmProfile"
import { nullablePromise } from "@utils/promise"
import { fetchFullVideosInfo } from "@utils/video"
import { store } from "@state/store"

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
    window.prefetchData = {}
    window.prefetchData.profile = profile
    window.prefetchData.videos = videos
  }
}

const profilePrefetcher = {
  match,
  fetch,
}

export default profilePrefetcher
