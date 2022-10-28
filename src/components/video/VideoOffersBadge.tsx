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

import { CurrencyDollarIcon } from "@heroicons/react/24/outline"

import { Badge } from "@/components/ui/display"

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { Video } from "@etherna/api-js"

type VideoOffersBadgeProps = {
  video: Video | null | undefined
  offersStatus: VideoOffersStatus["offersStatus"] | undefined
}

const VideoOffersBadge: React.FC<VideoOffersBadgeProps> = ({ video, offersStatus }) => {
  const getLabel = useCallback(() => {
    switch (offersStatus) {
      case "full":
      case "sources":
        return "Free to watch"
      case "partial":
        return "Partially free to watch"
      default:
        return "Pay to watch"
    }
  }, [offersStatus])

  if (!video) return null
  if (offersStatus === "none") return null

  return (
    <Badge
      variant="outline"
      prefix={<CurrencyDollarIcon width={20} aria-hidden />}
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
      {getLabel()}
    </Badge>
  )
}

export default VideoOffersBadge
