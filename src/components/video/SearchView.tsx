import React, { useRef } from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import VideoGrid from "./VideoGrid"
import { Text } from "@/components/ui/display"
import useSwarmVideos from "@/hooks/useSwarmVideos"

type SearchViewProps = {
  query: string
}

const SearchView: React.FC<SearchViewProps> = ({ query }) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const { videos, hasMore, isFetching, fetchCount, loadMore } = useSwarmVideos({ gridRef, query })

  return (
    <div>
      <Text as="h1">Search: {query}</Text>
      <div className="mt-6">
        {videos?.length === 0 && !isFetching && (
          <Text className="text-center">
            No videos found for <strong>{query}</strong>
          </Text>
        )}
        <InfiniteScroller
          dataLength={videos?.length ?? 0}
          next={loadMore}
          hasMore={hasMore}
          loader={<div />}
          style={{ overflow: "unset" }}
        >
          <VideoGrid
            videos={videos}
            isFetching={isFetching}
            fetchingPreviewCount={fetchCount || 9}
            ref={gridRef}
            singleColumn
          />
        </InfiniteScroller>
      </div>
    </div>
  )
}

export default SearchView
