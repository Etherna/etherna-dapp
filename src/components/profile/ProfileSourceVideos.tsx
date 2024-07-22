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

import { ExclamationCircleIcon } from "@heroicons/react/24/outline"

import { Alert } from "@/components/ui/display"
import VideoGrid from "@/components/video/VideoGrid"
import { FundsMissingError } from "@/errors/funds-missing-error"
import useSmartFetchCount from "@/hooks/useSmartFetchCount"
import { useChannelVideosQuery } from "@/queries/channel-videos-query"
import { useProfileQuery } from "@/queries/profile-query"

import type { ChannelSource } from "@/queries/channel-videos-query"
import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

interface ProfileSourceVideosProps {
  address: EthAddress | EnsAddress
  source: ChannelSource | undefined
  error?: Error | null
  isLoading?: boolean
  variant?: "default" | "preview"
  rows?: number
}

const ProfileSourceVideos: React.FC<ProfileSourceVideosProps> = ({
  address,
  source,
  isLoading,
  error,
  variant,
  rows,
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const defaultSeed = variant === "preview" ? 8 : 24
  const seedCount = useSmartFetchCount(gridRef, {
    defaultSeed,
    rows,
  })

  const profileQuery = useProfileQuery({
    address,
  })
  const videosQuery = useChannelVideosQuery({
    address,
    profile: profileQuery.data ?? null,
    source,
    firstFetchCount: seedCount ?? 0,
    sequentialFetchCount: 12,
  })

  const videos = videosQuery.data?.pages.flat() ?? []

  return (
    <div>
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

      <InfiniteScroller
        dataLength={videos.length}
        next={videosQuery.fetchNextPage}
        hasMore={variant === "preview" ? false : videosQuery.hasNextPage}
        loader={<div />}
        style={{ overflow: "unset" }}
      >
        <VideoGrid
          ref={gridRef}
          videos={videos}
          isFetching={isLoading}
          fetchingPreviewCount={seedCount ?? 0}
          hideOwner
        />
      </InfiniteScroller>
    </div>
  )
}

export default ProfileSourceVideos
