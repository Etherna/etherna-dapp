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

import { useVideoEditorState } from "../context"
import ThumbnailUpload, { ThumbnailUploadHandlers } from "../ThumbnailUpload"
import VideoSourcesUpload, { VideoSourcesUploadHandlers } from "../VideoSourcesUpload"
import PinContentField from "../PinContentField"
import MarkdownEditor from "@components/common/MarkdownEditor"

type VideoPropertiesProps = {
  isSubmitting?: boolean
}

const VideoProperties: React.FC<VideoPropertiesProps> = ({
  isSubmitting
}) => {
  const { state, actions } = useVideoEditorState()
  const { videoHandler } = state
  const { updatePinContent, updateTitle, updateDescription } = actions

  const videoFlow = useRef<VideoSourcesUploadHandlers>(null)
  const thumbFlow = useRef<ThumbnailUploadHandlers>(null)

  return (
    <>
      <div className="form-group">
        <VideoSourcesUpload
          ref={videoFlow}
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <ThumbnailUpload
          ref={thumbFlow}
          disabled={isSubmitting}
        />
      </div>
      <PinContentField onChange={pin => updatePinContent(pin)} />
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          placeholder="Title of the video"
          value={videoHandler.title ?? ""}
          onChange={e => updateTitle(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <MarkdownEditor
          placeholder="Description of the video"
          value={videoHandler.description ?? ""}
          onChange={value => updateDescription(value)}
          disabled={isSubmitting}
        />
      </div>
    </>
  )
}

export default VideoProperties
