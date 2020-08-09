import { getProfile } from "@utils/swarmProfile"
import { nullablePromise } from "@utils/promise"
import { fetchFullVideosInfo } from "@utils/video"

const match = /\/channel\/([^/]+)/

const fetch = async () => {
  const matches = window.location.pathname.match(match)
  if (matches && matches.length >= 2) {
    const address = matches[1]

    const [profile, videos] = await Promise.all([
      nullablePromise(getProfile(address)),
      nullablePromise(fetchFullVideosInfo(0, 50, false, address)),
    ])

    // set prefetch data
    window.prefetchData = {}
    window.prefetchData.profile = profile
    window.prefetchData.videos = videos
  }
}

export default {
  match,
  fetch,
}
