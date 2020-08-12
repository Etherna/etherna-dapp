import React from "react"
import PropTypes from "prop-types"
import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/media/VideoGrid"

const ProfileVideos = ({ videos, isFetching, hasMoreVideos, onLoadMore }) => {
  return (
    <>
      {!isFetching && (videos || []).length === 0 && (
        <p className="text-gray-500 text-center my-16">This profile has yet to upload a video</p>
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

ProfileVideos.propTypes = {
  videos: PropTypes.array,
  isFetching: PropTypes.bool,
  hasMoreVideos: PropTypes.bool,
  onLoadMore: PropTypes.func,
}

export default ProfileVideos
