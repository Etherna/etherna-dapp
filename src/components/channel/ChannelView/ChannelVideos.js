import React from "react"
import PropTypes from "prop-types"
import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/media/VideoGrid"

const ChannelVideos = ({ videos, hasChannel, isFetching, hasMoreVideos, onLoadMore }) => {
  return (
    <>
      {hasChannel && !isFetching && (videos || []).length === 0 && (
        <p className="text-gray-500 text-center my-16">This channel has yet to upload a video</p>
      )}
      {videos === undefined && (
        <VideoGrid mini={true} />
      )}
      {videos && videos.length > 0 && (
        <InfiniteScroller
          loadMore={onLoadMore}
          hasMore={hasMoreVideos}
          initialLoad={false}
          threshold={30}
        >
          <VideoGrid videos={videos} mini={true} />
        </InfiniteScroller>
      )}
    </>
  )
}

ChannelVideos.propTypes = {
  videos: PropTypes.array,
  hasChannel: PropTypes.bool,
  isFetching: PropTypes.bool,
  hasMoreVideos: PropTypes.bool,
  onLoadMore: PropTypes.func,
}

export default ChannelVideos
