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

import React, { forwardRef } from "react"

import VideoPreviewPlaceholder from "@/components/placeholders/VideoPreviewPlaceholder"
import VideoPreview from "@/components/video/VideoPreview"
import { cn } from "@/utils/classnames"

import type { WithIndexes, WithOffersStatus, WithOwner } from "@/types/video"
import type { Video } from "@etherna/sdk-js"

type VideoGridProps = {
  label?: string
  videos?: WithOwner<WithIndexes<WithOffersStatus<Video>>>[]
  isFetching?: boolean
  fetchingPreviewCount?: number
  mini?: boolean
  singleColumn?: boolean
  decentralizedLink?: boolean
}

const VideoGrid = forwardRef<HTMLDivElement, VideoGridProps>(
  (
    { label, videos, mini, singleColumn, isFetching, decentralizedLink, fetchingPreviewCount = 4 },
    ref
  ) => {
    const LabelTag = mini ? "h5" : "h3"

    return (
      <>
        {label && (
          <div className="mb-3 mt-4">
            <LabelTag>{label}</LabelTag>
          </div>
        )}
        <div
          className={cn(
            "mx-auto grid max-w-[2560px] grid-flow-row-dense gap-4",
            singleColumn
              ? {
                  "sm:gap-6": true,
                  "grid-cols-1 grid-rows-[repeat(auto-fill,minmax(150px,1fr))]": true,
                  "mx-auto max-w-screen-lg": true,
                }
              : {
                  "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]": !mini,
                  "lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]": !mini,
                  "xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]": !mini,
                  "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]": mini,
                  "lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]": mini,
                  "xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]": mini,
                }
          )}
          ref={ref}
        >
          {videos &&
            videos.map(video => (
              <VideoPreview
                video={video}
                videoOffers={video.offers}
                hideProfile={mini}
                decentralizedLink={decentralizedLink}
                direction={singleColumn ? "horizontal" : "vertical"}
                key={
                  video.indexesStatus
                    ? video.indexesStatus[Object.keys(video.indexesStatus)[0]]?.indexReference ??
                      video.reference
                    : video.reference
                }
              />
            ))}
          {isFetching &&
            Array(fetchingPreviewCount)
              .fill(0)
              .map((_, i) => (
                <VideoPreviewPlaceholder
                  mini={mini}
                  direction={singleColumn ? "horizontal" : "vertical"}
                  key={i}
                />
              ))}
        </div>
      </>
    )
  }
)

export default VideoGrid
