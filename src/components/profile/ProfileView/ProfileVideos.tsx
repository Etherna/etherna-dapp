import React from "react"
import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/media/VideoGrid"
import { VideoMetadata } from "@utils/video"

type ProfileVideosProps = {
  videos: VideoMetadata[]
  isFetching: boolean
  hasMoreVideos: boolean
  onLoadMore: (page: number) => void
}

const ProfileVideos = ({ videos, isFetching, hasMoreVideos, onLoadMore }: ProfileVideosProps) => {
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

export default ProfileVideos
