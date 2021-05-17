import React from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import VideoGrid from "@components/video/VideoGrid"
import { Video } from "@classes/SwarmVideo/types"

type ProfileVideosProps = {
  videos: Video[]
  isFetching: boolean
  hasMoreVideos: boolean
  onLoadMore(): void
}

const ProfileVideos: React.FC<ProfileVideosProps> = ({ videos, isFetching, hasMoreVideos, onLoadMore }) => {
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
          dataLength={videos?.length ?? 0}
          next={onLoadMore}
          hasMore={hasMoreVideos}
          scrollThreshold={30}
          loader={<div />}
        >
          <VideoGrid videos={videos} mini={true} />
        </InfiniteScroller>
      )}
    </>
  )
}

export default ProfileVideos
