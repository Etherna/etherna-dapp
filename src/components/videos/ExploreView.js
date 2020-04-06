import React, { useEffect, useState } from "react"
import InfiniteScroller from "react-infinite-scroller"

import { getVideos } from "utils/ethernaResources/videosResources"
import VideoGrid from "components/media/VideoGrid"

const FETCH_COUNT = 25

const ExploreView = () => {
    const [videos, setVideos] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        fetchVideos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchVideos = async () => {
        if (!hasMore) return

        try {
            const fetchedVideos = await getVideos(page, FETCH_COUNT)
            setVideos(page === 0 ? fetchedVideos : videos.concat(fetchVideos))

            if (fetchedVideos.length < FETCH_COUNT) {
                setHasMore(false)
            } else {
                setPage(page + 1)
            }
        } catch (error) {
            setHasMore(false)
        }
    }

    return (
        <InfiniteScroller
            loadMore={fetchVideos}
            hasMore={hasMore}
            initialLoad={false}
            threshold={30}
        >
            <VideoGrid label="Recommended videos" videos={videos} />
        </InfiniteScroller>
    )
}

export default ExploreView
