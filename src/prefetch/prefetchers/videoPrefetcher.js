import { getVideo } from "@utils/ethernaResources/videosResources"

const match = /\/watch/

const fetch = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams && searchParams.has("v")) {
        const hash = searchParams.get("v")

        try {
            const video = await getVideo(hash)
            // set prefetch data
            window.prefetchData = video
        } catch (error) {
            console.error(error)
        }
    }
}

export default {
    match,
    fetch,
}
