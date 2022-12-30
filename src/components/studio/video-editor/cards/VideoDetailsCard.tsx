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
import React, { useMemo } from "react"

import MarkdownEditor from "@/components/common/MarkdownEditor"
import ThumbnailUpload from "@/components/studio/video-editor/ThumbnailUpload"
import { Card, FormGroup } from "@/components/ui/display"
import { TextInput } from "@/components/ui/inputs"
import useVideoEditorStore from "@/stores/video-editor"

type VideoDetailsCardProps = {
  maxTitleLength: number | undefined
  maxDescriptionLength: number | undefined
  disabled?: boolean
}

const VideoDetailsCard: React.FC<VideoDetailsCardProps> = ({
  maxTitleLength,
  maxDescriptionLength,
  disabled,
}) => {
  const title = useVideoEditorStore(state => state.builder.previewMeta.title)
  const description = useVideoEditorStore(state => state.builder.detailsMeta.description)
  const updateTitle = useVideoEditorStore(state => state.updateTitle)
  const updateDescription = useVideoEditorStore(state => state.updateDescription)
  const initialDescription = useMemo(() => {
    return description
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card title="Video information">
      <FormGroup>
        <TextInput
          type="text"
          id="title"
          label="Title"
          placeholder="Title of the video"
          value={title}
          charactersLimit={maxTitleLength}
          onChange={value => updateTitle(value)}
          disabled={disabled}
        />
      </FormGroup>

      <FormGroup>
        <MarkdownEditor
          id="description"
          label="Description"
          placeholder="Description of the video"
          initialValue={initialDescription}
          charactersLimit={maxDescriptionLength}
          onChange={value => updateDescription(value)}
          disabled={disabled}
        />
      </FormGroup>

      <FormGroup>
        <ThumbnailUpload disabled={disabled} />
      </FormGroup>
    </Card>
  )
}

export default VideoDetailsCard
