import React from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import VideoGrid from "@components/video/VideoGrid"
import useSwarmVideos from "@hooks/useSwarmVideos"

const ExploreView = () => {
  const { videos, hasMore, loadMore } = useSwarmVideos()

  return (
    <InfiniteScroller
      dataLength={videos?.length ?? 0}
      next={loadMore}
      hasMore={hasMore}
      scrollThreshold={30}
      loader={<div />}
    >
      <VideoGrid videos={videos} />
    </InfiniteScroller>
  )
}

export default ExploreView
