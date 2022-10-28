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
import React, { useEffect } from "react"

import FieldDescription from "@/components/common/FieldDescription"
import { Card, Spinner } from "@/components/ui/display"
import { Toggle } from "@/components/ui/inputs"
import useVideoOffers from "@/hooks/useVideoOffers"
import useVideoEditorStore from "@/stores/video-editor"

type OffersCardProps = {
  disabled?: boolean
}

const OffersCard: React.FC<OffersCardProps> = ({ disabled }) => {
  const reference = useVideoEditorStore(state => state.reference)
  const video = useVideoEditorStore(state => state.video)
  const offerResources = useVideoEditorStore(state => state.offerResources)
  const toggleOfferResources = useVideoEditorStore(state => state.toggleOfferResources)
  const { videoOffersStatus } = useVideoOffers(video, {
    reference,
  })

  useEffect(() => {
    if (!videoOffersStatus) return
    toggleOfferResources(videoOffersStatus.userOffersStatus !== "none")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOffersStatus])

  return (
    <Card title="Offer resources">
      {videoOffersStatus === undefined && reference ? (
        <Spinner />
      ) : (
        <Toggle
          checked={offerResources}
          onChange={on => toggleOfferResources(on)}
          disabled={disabled}
        />
      )}
      <div className="py-1" />
      <FieldDescription>
        By offering the video resources you make the video available for everyone for free at your
        own cost.
      </FieldDescription>
    </Card>
  )
}

export default OffersCard
