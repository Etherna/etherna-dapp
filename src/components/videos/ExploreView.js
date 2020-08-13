import React, { useEffect, useState } from "react"
import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/media/VideoGrid"
import { fetchFullVideosInfo } from "@utils/video"

const FETCH_COUNT = 25

const ExploreView = () => {
  const [videos, setVideos] = useState(undefined)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchVideos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVideos = async () => {
    if (!hasMore) return

    try {
      const fetchedVideos = await fetchFullVideosInfo(page, FETCH_COUNT)
      setVideos(page === 0 ? fetchedVideos : videos.concat(fetchVideos))

      if (fetchedVideos.length < FETCH_COUNT) {
        setHasMore(false)
      } else {
        setPage(page + 1)
      }
    } catch (error) {
      setVideos([])
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
      <VideoGrid label="New videos" videos={videos} />
    </InfiniteScroller>
  )
}

export default ExploreView
