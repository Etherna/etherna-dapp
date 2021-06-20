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
import classnames from "classnames"

import "./video-grid.scss"

import VideoPreviewPlaceholder from "../VideoPreviewPlaceholder"
import VideoPreview from "@components/video/VideoPreview"
import { Video } from "@classes/SwarmVideo/types"

type VideoGridProps = {
  label?: string
  videos?: Video[]
  mini?: boolean
}

const VideoGrid: React.FC<VideoGridProps> = ({ label, videos, mini }) => {
  const LabelTag = mini ? "h5" : "h3"
  return (
    <>
      {label && (
        <div className="video-grid-header">
          <LabelTag>{label}</LabelTag>
        </div>
      )}
      <div className={classnames("video-grid", { mini: mini })}>
        {videos === undefined && <VideoPreviewPlaceholder />}
        {videos &&
          videos.map((v, i) => (
            <VideoPreview video={v} hideProfile={mini} key={v.hash + `_${i}`} />
          ))}
      </div>
    </>
  )
}

export default VideoGrid
