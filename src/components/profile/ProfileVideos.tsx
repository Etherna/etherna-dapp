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
import InfiniteScroller from "react-infinite-scroll-component"

import VideoGrid from "@/components/video/VideoGrid"
import type { Video } from "@/definitions/swarm-video"

type ProfileVideosProps = {
  videos: Video[] | null | undefined
  isFetching: boolean
  hasMoreVideos: boolean
  onLoadMore(): void
}

const ProfileVideos: React.FC<ProfileVideosProps> = ({ videos, isFetching, hasMoreVideos, onLoadMore }) => {
  return (
    <>
      {!isFetching && videos?.length === 0 && (
        <p className="text-gray-500 text-center my-16">This profile has yet to upload a video</p>
      )}

      <InfiniteScroller
        dataLength={videos?.length ?? 0}
        next={onLoadMore}
        hasMore={hasMoreVideos}
        scrollThreshold={30}
        loader={<div />}
      >
        <VideoGrid videos={videos ?? []} mini={true} isFetching={isFetching} decentralizedLink />
      </InfiniteScroller>
    </>
  )
}

export default ProfileVideos
