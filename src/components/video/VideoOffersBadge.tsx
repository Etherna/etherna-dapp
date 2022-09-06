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

import { CurrencyDollarIcon } from "@heroicons/react/outline"

import { Badge } from "../ui/display"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

type VideoOffersBadgeProps = {
  video: Video | null | undefined
  offersStatus: VideoOffersStatus["offersStatus"] | undefined
}

const VideoOffersBadge: React.FC<VideoOffersBadgeProps> = ({ video, offersStatus }) => {
  if (!video) return null
  if (offersStatus === "none") return null

  const getLabel = () => {
    switch (offersStatus) {
      case "full":
      case "sources":
        return "Free to watch"
      case "partial":
        return "Partially free to watch"
      default:
        return "Pay to watch"
    }
  }

  return (
    <Badge
      variant="outline"
      color={
        offersStatus === "full"
          ? "primary"
          : offersStatus === "partial"
          ? "indigo"
          : offersStatus === "sources"
          ? "info"
          : "muted"
      }
    >
      <CurrencyDollarIcon width={20} className="mr-1" aria-hidden />
      {getLabel()}
    </Badge>
  )
}

export default VideoOffersBadge
