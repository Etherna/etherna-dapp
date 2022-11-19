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
import React, { useEffect, useRef } from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import { ExclamationCircleIcon } from "@heroicons/react/24/solid"

import { Alert } from "@/components/ui/display"
import VideoGrid from "@/components/video/VideoGrid"
import useSwarmVideos from "@/hooks/useSwarmVideos"

const ExploreView = () => {
  const gridRef = useRef<HTMLDivElement>(null)
  const { videos, hasMore, isFetching, fetchCount, error, loadMore, refresh } = useSwarmVideos({
    gridRef,
  })

  useEffect(() => {
    window.addEventListener("refresh", refresh)
    return () => {
      window.removeEventListener("refresh", refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <InfiniteScroller
      dataLength={videos?.length ?? 0}
      next={loadMore}
      hasMore={hasMore}
      loader={<div />}
      style={{ overflow: "unset" }}
    >
      {error && (
        <Alert color="error" icon={<ExclamationCircleIcon />}>
          {error}
        </Alert>
      )}

      <VideoGrid
        videos={videos}
        isFetching={isFetching}
        fetchingPreviewCount={fetchCount || 9}
        ref={gridRef}
      />
    </InfiniteScroller>
  )
}

export default ExploreView
