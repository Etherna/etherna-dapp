import React from "react"
import classnames from "classnames"

import "./video-status-badge.scss"
import { ReactComponent as UnindexedIcon } from "@svg/icons/unindexed.svg"

type VideoStatusBadgeProps = {
  status: "available" | "unlisted" | "unindexed"
}

const VideoStatusBadge: React.FC<VideoStatusBadgeProps> = ({ status }) => {
  if (status === "available") return null

  const getLabel = () => {
    switch (status) {
      case "unindexed": return "Unindexed"
      case "unlisted": return "Unlisted"
      default: return "nd"
    }
  }

  return (
    <div className={classnames("video-status-badge", {
      "unindexed": status === "unindexed",
      "unlisted": status === "unlisted",
    })}>
      <UnindexedIcon className="fill-orange-800" />
      {getLabel()}
    </div>
  )
}

export default VideoStatusBadge
