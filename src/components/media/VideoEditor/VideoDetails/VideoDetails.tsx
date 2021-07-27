import React, { useRef } from "react"

import MarkdownEditor from "@common/MarkdownEditor"
import ThumbnailUpload, { ThumbnailUploadHandlers } from "@components/media/VideoEditor/ThumbnailUpload"
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

      <div className="form-group">
        <ThumbnailUpload
          ref={thumbFlow}
          disabled={isSubmitting}
        />
      </div>
    </>
  )
}

export default VideoDetails
