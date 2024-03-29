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

import React, { useCallback } from "react"

import { ReactComponent as UnindexedIcon } from "@/assets/icons/unindexed.svg"

import { Badge } from "@/components/ui/display"

type VideoStatusBadgeProps = {
  status: "available" | "unlisted" | "unindexed"
}

const VideoStatusBadge: React.FC<VideoStatusBadgeProps> = ({ status }) => {
  const getLabel = useCallback(() => {
    switch (status) {
      case "unindexed":
        return "Unindexed"
      case "unlisted":
        return "Unlisted"
      default:
        return "nd"
    }
  }, [status])

  if (status === "available") return null

  return (
    <Badge
      className="text-orange-800"
      color="warning"
      prefix={<UnindexedIcon width={16} className="fill-orange-800" />}
    >
      {getLabel()}
    </Badge>
  )
}

export default VideoStatusBadge
