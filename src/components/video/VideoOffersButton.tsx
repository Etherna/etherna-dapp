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
import type { Video } from "@etherna/api-js"

import { CurrencyDollarIcon } from "@heroicons/react/24/outline"

import VideoDetailsButton from "./VideoDetailsButton"
import VideoOffersModal from "@/components/modals/VideoOffersModal"
import type { VideoOffersStatus } from "@/hooks/useVideoOffers"

type VideoOffersButtonProps = {
  video: Video | null | undefined
  videoOffersStatus: VideoOffersStatus | undefined
  onOfferResources(): Promise<void>
  onUnofferResources(): Promise<void>
}

const VideoOffersButton: React.FC<VideoOffersButtonProps> = ({
  video,
  videoOffersStatus,
  onOfferResources,
  onUnofferResources,
}) => {
  const [showOffersModal, setShowOffersModal] = useState(false)

  if (!video) return null

  return (
    <>
      <VideoDetailsButton
        icon={<CurrencyDollarIcon width={20} aria-hidden />}
        onClick={() => setShowOffersModal(true)}
      >
        Offer content
      </VideoDetailsButton>

      <VideoOffersModal
        show={showOffersModal}
        offersStatus={videoOffersStatus}
        video={video}
        offerResources={onOfferResources}
        unofferResources={onUnofferResources}
        onClose={() => setShowOffersModal(false)}
      />
    </>
  )
}

export default VideoOffersButton
