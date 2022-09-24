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
import type { VideoSource } from "@etherna/api-js"

import MediaStats from "@/components/media/MediaStats"
import { convertBirate, convertBytes } from "@/utils/converters"

type VideoSourceStatsProps = {
  source: VideoSource | undefined
}

const VideoSourceStats: React.FC<VideoSourceStatsProps> = ({ source }) => {
  if (!source) return null

  const stats = [
    source.size ? { label: "Size", value: convertBytes(source.size).readable } : false,
    source.bitrate ? { label: "Bitrate", value: convertBirate(source.bitrate).readable } : false,
    { label: "Hash", value: source.reference },
    {
      label: "Preview",
      value: (
        <a href={source.source} target="_blank" rel="noreferrer">
          {source.source}
        </a>
      ),
    },
  ].filter(Boolean) as Array<{ label: string; value: string | JSX.Element }>

  return (
    <div>
      <MediaStats stats={stats} showText="Show source stats" hideText="Hide source stats" />
    </div>
  )
}

export default VideoSourceStats
