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

import React, { useState } from "react"
import classNames from "classnames"

import classes from "@/styles/components/video/VideoOffersBadge.module.scss"
import { CurrencyDollarIcon } from "@heroicons/react/outline"

import useVideoOffers from "@/hooks/useVideoOffers"
import useSelector from "@/state/useSelector"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

type VideoOffersBadgeProps = {
  video: Video | null | undefined
  videoOffers?: VideoOffersStatus
}

const VideoOffersBadge: React.FC<VideoOffersBadgeProps> = ({ video, videoOffers }) => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const { videoOffersStatus, offerResources, unofferResources } = useVideoOffers(video, {
    routeState: videoOffers,
    disable: isStandaloneGateway,
  })
  const offersStatus = videoOffersStatus?.offersStatus

  if (!video) return null
  if (isStandaloneGateway) return null
  if (offersStatus === "none") return null

  const getLabel = () => {
    switch (offersStatus) {
      case "full": case "sources": return "Free to watch"
      case "partial": return "Partially free to watch"
      default: return "Pay to watch"
    }
  }

  return (
    <div
      className={classNames(classes.videoOffersBadge, {
        [classes.fullOffered]: offersStatus === "full" || offersStatus === "sources",
        [classes.partialOffered]: offersStatus === "partial",
      })}
    >
      <CurrencyDollarIcon aria-hidden />
      {getLabel()}
    </div>
  )
}

export default VideoOffersBadge
