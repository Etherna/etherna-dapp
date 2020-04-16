import { getProfile } from "@utils/3box"
import { getChannelVideos } from "@utils/ethernaResources/channelResources"

const match = /\/channel\/([^/]+)/

const fetch = async () => {
    const matches = window.location.pathname.match(match)
    if (matches && matches.length >= 2) {
        const address = matches[1]

        try {
            const profile = await getProfile(address)
            const videos = await getChannelVideos(address, 0, 50)
            // set prefetch data
            window.prefetchData = {}
            window.prefetchData.profile = profile
            window.prefetchData.videos = videos
        } catch (error) {
            console.error(error)
        }
    }
}

export default {
    match,
    fetch
}