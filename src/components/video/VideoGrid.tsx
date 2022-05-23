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
import classNames from "classnames"

import classes from "@styles/components/video/VideoGrid.module.scss"

import VideoPreviewPlaceholder from "@components/placeholders/VideoPreviewPlaceholder"
import VideoPreview from "@components/video/VideoPreview"
import useVideosResources from "@hooks/useVideosResources"
import type { Video } from "@definitions/swarm-video"

type VideoGridProps = {
  label?: string
  videos?: Video[]
  isFetching?: boolean
  fetchingPreviewCount?: number
  mini?: boolean
  decentralizedLink?: boolean
}

const VideoGrid: React.FC<VideoGridProps> = ({
  label,
  videos,
  mini,
  isFetching,
  decentralizedLink,
  fetchingPreviewCount = 4,
}) => {
  const { videosOffersStatus } = useVideosResources(videos)

  const LabelTag = mini ? "h5" : "h3"

  return (
    <>
      {label && (
        <div className={classes.videoGridHeader}>
          <LabelTag>{label}</LabelTag>
        </div>
      )}
      <div className={classNames(classes.videoGrid, { [classes.mini]: mini })}>
        {videos && videos.map(video => (
          <VideoPreview
            video={video}
            videoOffers={videosOffersStatus?.[video.reference]}
            hideProfile={mini}
            decentralizedLink={decentralizedLink}
            key={video.reference}
          />
        ))}
        {isFetching && (
          Array(fetchingPreviewCount).fill(0).map((_, i) => (
            <VideoPreviewPlaceholder mini={mini} key={i} />
          ))
        )}
      </div>
    </>
  )
}

export default VideoGrid
