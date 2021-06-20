/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React from "react"
import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/video/VideoGrid"
import { Video } from "@classes/SwarmVideo/types"

type ProfileVideosProps = {
  videos: Video[]
  isFetching: boolean
  hasMoreVideos: boolean
  onLoadMore: (page: number) => void
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
