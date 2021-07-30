import React from "react"

import "./video-source-stats.scss"

import MediaStats from "@components/media/MediaStats"
import { VideoSource } from "@classes/SwarmVideo/types"
import { convertBirate, convertBytes } from "@utils/converters"

type VideoSourceStatsProps = {
  source: VideoSource | undefined
}

const VideoSourceStats: React.FC<VideoSourceStatsProps> = ({ source }) => {
  if (!source) return null

  const stats = [
    source.size ? { label: "Size", value: convertBytes(source.size).readable } : false,
    source.bitrate ? { label: "Bitrate", value: convertBirate(source.bitrate).readable } : false,
    { label: "Hash", value: source.reference },
    { label: "Protocol", value: source.referenceProtocol },
    { label: "Preview", value: <a href={source.source} target="_blank" rel="noreferrer">{source.source}</a> },
  ].filter(Boolean) as Array<{ label: string, value: string | JSX.Element }>

  return (
    <div className="video-source-stats">
      <MediaStats
        stats={stats}
        showText="Show source stats"
        hideText="Hide source stats"
      />
    </div>
  )
}

export default VideoSourceStats
