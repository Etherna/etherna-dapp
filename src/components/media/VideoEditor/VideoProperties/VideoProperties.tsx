import React, { useRef } from "react"

import MarkdownEditor from "@common/MarkdownEditor"
import ThumbnailUpload, { ThumbnailUploadHandlers } from "@components/media/VideoEditor/ThumbnailUpload"
import VideoSourcesUpload, { VideoSourcesUploadHandlers } from "@components/media/VideoEditor/VideoSourcesUpload"
import PinContentField from "@components/media/VideoEditor/PinContentField"
import { useVideoEditorInfoActions, useVideoEditorState } from "@context/video-editor-context/hooks"

type VideoPropertiesProps = {
  isSubmitting?: boolean
}

const VideoProperties: React.FC<VideoPropertiesProps> = ({
  isSubmitting
}) => {
  const [{ videoHandler }] = useVideoEditorState()
  const { updatePinContent, updateTitle, updateDescription } = useVideoEditorInfoActions()

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
