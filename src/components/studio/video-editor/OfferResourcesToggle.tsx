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

import Label from "@/components/common/Label"
import Spinner from "@/components/common/Spinner"
import FieldDesrcription from "@/components/common/FieldDesrcription"
import Toggle from "@/components/common/Toggle"
import { useVideoEditorExtrasActions, useVideoEditorState } from "@/context/video-editor-context/hooks"
import useVideoOffers from "@/hooks/useVideoOffers"

const OfferResourcesToggle: React.FC = () => {
  const [{ reference, videoWriter }] = useVideoEditorState()
  const { offerResources, updateOfferResources } = useVideoEditorExtrasActions()
  const { videoOffersStatus } = useVideoOffers(videoWriter.videoRaw, {
    reference
  })

  useEffect(() => {
    if (!videoOffersStatus) return
    updateOfferResources(videoOffersStatus.offersStatus !== "none")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOffersStatus])

  return (
    <>
      <Label>Offer resources</Label>
      {videoOffersStatus === undefined && reference ? (
        <Spinner />
      ) : (
        <Toggle
          checked={offerResources}
          onChange={updateOfferResources}
        />
      )}
      <FieldDesrcription>
        By offering the video resources you make the video available for everyone for free.
      </FieldDesrcription>
    </>
  )
}

export default OfferResourcesToggle
