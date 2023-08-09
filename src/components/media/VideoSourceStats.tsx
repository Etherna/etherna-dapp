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
import { getBitrate } from "@etherna/sdk-js/utils"

import MediaStats from "@/components/media/MediaStats"
import { convertBirate, convertBytes } from "@/utils/converters"

import type { VideoSource } from "@etherna/sdk-js"

type VideoSourceStatsProps = {
  source: VideoSource | undefined
  duration?: number
  entry?: string
}

const VideoSourceStats: React.FC<VideoSourceStatsProps> = ({ source, duration, entry }) => {
  if (!source) return null

  const stats = [
    source.type === "mp4" && source.size
      ? { label: "Size", value: convertBytes(source.size).readable }
      : false,
    source.type === "mp4" && duration
      ? {
          label: "Bitrate",
          value: convertBirate(getBitrate(source.size, duration)).readableBits,
        }
      : false,
    entry ? { label: "Hash", value: entry } : false,
    // {
    //   label: "Preview",
    //   value: (
    //     <a href={source.url} target="_blank" rel="noreferrer">
    //       {source.url}
    //     </a>
    //   ),
    // },
  ].filter(Boolean) as Array<{ label: string; value: string | JSX.Element }>

  return (
    <div>
      <MediaStats stats={stats} showText="Show source stats" hideText="Hide source stats" />
    </div>
  )
}

export default VideoSourceStats
