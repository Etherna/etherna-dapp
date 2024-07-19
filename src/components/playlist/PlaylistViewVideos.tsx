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

import React, { useRef } from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import VideoGrid from "@/components/video/VideoGrid"
import useEffectOnce from "@/hooks/useEffectOnce"
import usePlaylistVideos from "@/hooks/usePlaylistVideos"
import useSmartFetchCount from "@/hooks/useSmartFetchCount"

import type { Playlist } from "@etherna/sdk-js"

interface PlaylistViewVideosProps {
  playlist: Playlist
}

const PlaylistViewVideos: React.FC<PlaylistViewVideosProps> = ({ playlist }) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const seedLimit =
    useSmartFetchCount(gridRef, {
      defaulSeed: 12,
    }) ?? 0
  const { videos, isFetching, hasMore, loadMore } = usePlaylistVideos(playlist, {
    seedLimit,
  })

  return (
    <div className="flex-1 overflow-hidden">
      {playlist.details.videos.length === 0 && (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-gray-700 dark:text-gray-300">No videos in this playlist</p>
        </div>
      )}

      <InfiniteScroller
        dataLength={videos?.length ?? 0}
        next={loadMore}
        hasMore={hasMore}
        loader={<div />}
        style={{ overflow: "unset" }}
      >
        <VideoGrid
          ref={gridRef}
          videos={videos}
          isFetching={isFetching}
          fetchingPreviewCount={12}
        />
      </InfiniteScroller>
    </div>
  )
}

export default PlaylistViewVideos
