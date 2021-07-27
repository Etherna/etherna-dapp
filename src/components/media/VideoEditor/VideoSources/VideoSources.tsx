import React, { useRef } from "react"

import VideoSourcesUpload, { VideoSourcesUploadHandlers } from "@components/media/VideoEditor/VideoSourcesUpload"

type VideoSourcesProps = {
  isSubmitting: boolean
}

const VideoSources: React.FC<VideoSourcesProps> = ({ isSubmitting }) => {
  const videoFlow = useRef<VideoSourcesUploadHandlers>(null)

  return (
    <>
      <div className="form-group">
        <VideoSourcesUpload
          ref={videoFlow}
          disabled={isSubmitting}
        />
      </div>
    </>
  )
}

export default VideoSources
