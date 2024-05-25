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

import { ExclamationCircleIcon } from "@heroicons/react/24/solid"

import { Alert } from "@/components/ui/display"
import VideoGrid from "@/components/video/VideoGrid"
import { FundsMissingError } from "@/errors/funds-missing-error"

import type { VideoWithAll, VideoWithOwner } from "@/types/video"

type ProfileVideosProps = {
  videos: VideoWithOwner[] | null | undefined
  error?: Error | null
  isFetching: boolean
  hasMoreVideos: boolean
  fetchingPreviewCount?: number
  gridRef?: React.RefObject<HTMLDivElement>
  onLoadMore(): void
}

const ProfileVideos: React.FC<ProfileVideosProps> = ({
  videos,
  error,
  isFetching,
  hasMoreVideos,
  fetchingPreviewCount,
  gridRef,
  onLoadMore,
}) => {
  const videosWithIndexes = useMemo(() => {
    return (videos ?? []).map(
      video =>
        ({
          ...video,
          indexesStatus: {},
          offers: undefined,
        }) as VideoWithAll
    )
  }, [videos])

  return (
    <>
      {!isFetching && videos && videos.length === 0 && !error && (
        <p className="my-16 text-center text-gray-500">This profile has yet to upload a video</p>
      )}

      <InfiniteScroller
        dataLength={videos?.length ?? 0}
        next={onLoadMore}
        hasMore={hasMoreVideos}
        scrollThreshold={30}
        loader={<div />}
      >
        {error && !(error instanceof FundsMissingError) && (
          <Alert color="error" icon={<ExclamationCircleIcon />}>
            {error.message}
          </Alert>
        )}
        {error && error instanceof FundsMissingError && (
          <Alert color="error" icon={<ExclamationCircleIcon />}>
            <p className="text-lg/none font-semibold">{error.title}</p>
            <p className="mt-2 text-sm">{error.message}</p>
          </Alert>
        )}

        <VideoGrid
          ref={gridRef}
          videos={videosWithIndexes}
          mini={true}
          isFetching={isFetching}
          fetchingPreviewCount={fetchingPreviewCount}
          decentralizedLink
        />
      </InfiniteScroller>
    </>
  )
}

export default ProfileVideos
