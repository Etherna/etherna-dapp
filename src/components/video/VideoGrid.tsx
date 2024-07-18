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

import { ExclamationCircleIcon } from "@heroicons/react/24/solid"

import VideoPreviewPlaceholder from "@/components/placeholders/VideoPreviewPlaceholder"
import { Alert } from "@/components/ui/display"
import MediaGrid from "@/components/ui/layout/MediaGrid"
import VideoPreview from "@/components/video/VideoPreview"

import type { AnyListVideo } from "@/types/video"

type VideoGridProps = {
  label?: string
  videos?: (AnyListVideo | null)[]
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
        <MediaGrid variant={singleColumn ? "single-col" : "default"} ref={ref}>
          {videos &&
            videos.map((video, i) =>
              video ? (
                <VideoPreview
                  video={video}
                  videoOffers={"offers" in video ? video.offers : undefined}
                  hideProfile={mini}
                  decentralizedLink={decentralizedLink}
                  direction={singleColumn ? "horizontal" : "vertical"}
                  key={i}
                />
              ) : (
                <div
                  key={i}
                  className="relative mt-3 overflow-hidden"
                  style={{
                    paddingBottom: (9 / 16) * 100 + "%",
                  }}
                >
                  <Alert className="absolute inset-0 px-3 py-8" color="error">
                    <div className="flex flex-col items-center">
                      <ExclamationCircleIcon width={24} />
                      <p className="text-center text-sm">Cannot fetch video</p>
                    </div>
                  </Alert>
                </div>
              )
            )}
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
        </MediaGrid>
      </>
    )
  }
)

export default VideoGrid
