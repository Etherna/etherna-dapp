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

import { CurrencyDollarIcon } from "@heroicons/react/24/outline"

import VideoDetailsButton from "./VideoDetailsButton"
import VideoSupportModal from "@/components/modals/VideoSupportModal"

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { VideoPinningStatus } from "@/hooks/useVideoPinning"
import type { Video } from "@etherna/sdk-js"

type VideoOffersButtonProps = {
  video: Video | null | undefined
  videoOffersStatus: VideoOffersStatus | undefined
  videoPinningStatus: VideoPinningStatus | undefined
  onOfferResources(): Promise<void>
  onUnofferResources(): Promise<void>
  onPinResources(): Promise<void>
  onUnpinResources(): Promise<void>
}

const VideoOffersButton: React.FC<VideoOffersButtonProps> = ({
  video,
  videoOffersStatus,
  videoPinningStatus,
  onOfferResources,
  onUnofferResources,
  onPinResources,
  onUnpinResources,
}) => {
  const [showOffersModal, setShowOffersModal] = useState(false)

  if (!video) return null

  return (
    <>
      <VideoDetailsButton
        icon={<CurrencyDollarIcon width={20} aria-hidden />}
        onClick={() => setShowOffersModal(true)}
      >
        Support
      </VideoDetailsButton>

      <VideoSupportModal
        show={showOffersModal}
        offersStatus={videoOffersStatus}
        pinningStatus={videoPinningStatus}
        video={video}
        offerResources={onOfferResources}
        unofferResources={onUnofferResources}
        pinResources={onPinResources}
        unpinResources={onUnpinResources}
        onClose={() => setShowOffersModal(false)}
      />
    </>
  )
}

export default VideoOffersButton
