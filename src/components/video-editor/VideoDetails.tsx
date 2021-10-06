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

import ThumbnailUpload, { ThumbnailUploadHandlers } from "./ThumbnailUpload"
import MarkdownEditor from "@common/MarkdownEditor"
import TextField from "@common/TextField"
import FormGroup from "@common/FormGroup"
import { useVideoEditorInfoActions, useVideoEditorState } from "@context/video-editor-context/hooks"

type VideoDetailsProps = {
  isSubmitting: boolean
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ isSubmitting }) => {
  const [{ videoHandler }] = useVideoEditorState()
  const { updateTitle, updateDescription } = useVideoEditorInfoActions()

  const thumbFlow = useRef<ThumbnailUploadHandlers>(null)

  return (
    <>
      <FormGroup>
        <TextField
          type="text"
          id="title"
          label="Title"
          placeholder="Title of the video"
          value={videoHandler.title ?? ""}
          charactersLimit={150}
          onChange={updateTitle}
          disabled={isSubmitting}
        />
      </FormGroup>

      <FormGroup>
        <MarkdownEditor
          id="description"
          label="Description"
          placeholder="Description of the video"
          value={videoHandler.description ?? ""}
          charactersLimit={5000}
          onChange={value => updateDescription(value)}
          disabled={isSubmitting}
        />
      </FormGroup>

      <FormGroup>
        <ThumbnailUpload
          ref={thumbFlow}
          disabled={isSubmitting}
        />
      </FormGroup>
    </>
  )
}

export default VideoDetails
