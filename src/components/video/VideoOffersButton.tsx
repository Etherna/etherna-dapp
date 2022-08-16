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

import { CurrencyDollarIcon } from "@heroicons/react/outline"

import VideoDetailsButton from "./VideoDetailsButton"
import VideoOffersModal from "@/components/modals/VideoOffersModal"
import useVideoOffers from "@/hooks/useVideoOffers"
import useSelector from "@/state/useSelector"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

type VideoOffersButtonProps = {
  video: Video | null | undefined
  videoOffers?: VideoOffersStatus
}

const VideoOffersButton: React.FC<VideoOffersButtonProps> = ({ video, videoOffers }) => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const { videoOffersStatus, offerResources, unofferResources } = useVideoOffers(video, {
    routeState: videoOffers,
    disable: isStandaloneGateway,
  })
  const [showOffersModal, setShowOffersModal] = useState(false)

  if (!video || isStandaloneGateway) return null

  return (
    <>
      <VideoDetailsButton onClick={() => setShowOffersModal(true)}>
        <CurrencyDollarIcon aria-hidden />
        Offer content
      </VideoDetailsButton>

      <VideoOffersModal
        show={showOffersModal}
        offersStatus={videoOffersStatus}
        video={video}
        offerResources={async () => await offerResources()}
        unofferResources={async () => await unofferResources()}
        onClose={() => setShowOffersModal(false)}
      />
    </>
  )
}

export default VideoOffersButton