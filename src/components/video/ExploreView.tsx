import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/video/VideoGrid"
import useSwarmVideos from "@hooks/useSwarmVideos"

const ExploreView = () => {
  const { videos, hasMore, loadMore } = useSwarmVideos()

  return (
    <InfiniteScroller
      loadMore={loadMore}
      hasMore={hasMore}
      initialLoad={false}
      threshold={30}
    >
      <VideoGrid label="New videos" videos={videos} />
    </InfiniteScroller>
  )
}

export default ExploreView
