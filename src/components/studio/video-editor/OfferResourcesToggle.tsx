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

import Label from "@common/Label"
import FieldDesrcription from "@common/FieldDesrcription"
import Toggle from "@common/Toggle"
import { useVideoEditorExtrasActions, useVideoEditorState } from "@context/video-editor-context/hooks"

const OfferResourcesToggle: React.FC = () => {
  const [{ offerResources }] = useVideoEditorState()
  const { updateOfferResources } = useVideoEditorExtrasActions()

  return (
    <>
      <Label>Offer resources</Label>
      <Toggle
        // label={pinContent ? "Pinning enabled" : "Pinning disabled"}
        checked={offerResources}
        onChange={updateOfferResources}
      />
      <FieldDesrcription>
        By offering the video resources you make the video available for everyone for free.
      </FieldDesrcription>
    </>
  )
}

export default OfferResourcesToggle
