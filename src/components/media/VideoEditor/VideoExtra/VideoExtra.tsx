import React from "react"

import PinContentField from "@components/media/VideoEditor/PinContentField"
import { useVideoEditorInfoActions } from "@context/video-editor-context/hooks"

type VideoExtraProps = {
  isSubmitting: boolean
}

const VideoExtra: React.FC<VideoExtraProps> = ({ isSubmitting }) => {
  const { updatePinContent } = useVideoEditorInfoActions()

  return (
    <>
      <div className="form-group">
        <PinContentField onChange={pin => updatePinContent(pin)} />
      </div>
    </>
  )
}

export default VideoExtra
