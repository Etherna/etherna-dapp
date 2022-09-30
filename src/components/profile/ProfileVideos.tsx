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

import React, { useMemo } from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import VideoGrid from "@/components/video/VideoGrid"
import type { VideoWithIndexes, VideoWithOffersStatus, VideoWithOwner } from "@/types/video"

type ProfileVideosProps = {
  videos: VideoWithOwner[] | null | undefined
  isFetching: boolean
  hasMoreVideos: boolean
  onLoadMore(): void
}

const ProfileVideos: React.FC<ProfileVideosProps> = ({
  videos,
  isFetching,
  hasMoreVideos,
  onLoadMore,
}) => {
  const videosWithIndexes = useMemo(() => {
    return (videos ?? []).map(
      video =>
        ({
          ...video,
          indexesStatus: {},
          offers: undefined,
        } as VideoWithIndexes & VideoWithOwner & VideoWithOffersStatus)
    )
  }, [videos])

  return (
    <>
      {!isFetching && videos?.length === 0 && (
        <p className="my-16 text-center text-gray-500">This profile has yet to upload a video</p>
      )}

      <InfiniteScroller
        dataLength={videos?.length ?? 0}
        next={onLoadMore}
        hasMore={hasMoreVideos}
        scrollThreshold={30}
        loader={<div />}
      >
        <VideoGrid
          videos={videosWithIndexes}
          mini={true}
          isFetching={isFetching}
          decentralizedLink
        />
      </InfiniteScroller>
    </>
  )
}

export default ProfileVideos
