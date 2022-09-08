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

import React, { useRef } from "react"

import type { VideoSourcesUploadHandlers } from "./VideoSourcesUpload"
import VideoSourcesUpload from "./VideoSourcesUpload"
import { FormGroup } from "@/components/ui/display"

type VideoSourcesProps = {
  initialDragPortal?: string
  isSubmitting: boolean
}

const VideoSources: React.FC<VideoSourcesProps> = ({ isSubmitting, initialDragPortal }) => {
  const videoFlow = useRef<VideoSourcesUploadHandlers>(null)

  return (
    <FormGroup>
      <VideoSourcesUpload
        ref={videoFlow}
        initialDragPortal={initialDragPortal}
        disabled={isSubmitting}
      />
    </FormGroup>
  )
}

export default VideoSources
