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

// import PinContentField from "./PinContentField"
// import AudienceSelector from "./AudienceSelector"
// import VisibilitySelector from "./VisibilitySelector"
import SaveToSelector from "./SaveToSelector"
import OfferResourcesToggle from "./OfferResourcesToggle"
import FormGroup from "@common/FormGroup"

type VideoExtraProps = {
  isSubmitting: boolean
}

const VideoExtra: React.FC<VideoExtraProps> = ({ }) => {
  // const { updatePinContent } = useVideoEditorInfoActions()

  return (
    <>
      {/* <FormGroup disabled>
        <AudienceSelector />
      </FormGroup> */}

      {/* <FormGroup>
        <PinContentField />
      </FormGroup> */}

      {/* <FormGroup disabled>
        <VisibilitySelector />
      </FormGroup> */}

      <FormGroup>
        <OfferResourcesToggle />
      </FormGroup>

      <FormGroup>
        <SaveToSelector />
      </FormGroup>
    </>
  )
}

export default VideoExtra
