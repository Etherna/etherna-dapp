import React, { useRef } from "react"

import MarkdownEditor from "@common/MarkdownEditor"
import ThumbnailUpload, { ThumbnailUploadHandlers } from "@components/media/VideoEditor/ThumbnailUpload"
import { useVideoEditorInfoActions, useVideoEditorState } from "@context/video-editor-context/hooks"
import TextField from "@common/TextField"
import FormGroup from "@common/FormGroup"

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
