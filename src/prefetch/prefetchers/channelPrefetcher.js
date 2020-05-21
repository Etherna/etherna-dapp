import { getProfile } from "@utils/swarmProfile"
import { getChannelVideos } from "@utils/ethernaResources/channelResources"
import promisePipeline from "@utils/promisePipeline"

const match = /\/channel\/([^/]+)/

const fetch = async () => {
    const matches = window.location.pathname.match(match)
    if (matches && matches.length >= 2) {
        const address = matches[1]

        const [
            profile,
            videos
        ] = await promisePipeline([
            getProfile(address),
            getChannelVideos(address, 0, 50)
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
