import React from "react"

import FormGroup from "@common/FormGroup"
import PinContentField from "@components/media/VideoEditor/PinContentField"
import AudienceSelector from "@components/media/VideoEditor/AudienceSelector"
import VisibilitySelector from "@components/media/VideoEditor/VisibilitySelector"
import { useVideoEditorInfoActions } from "@context/video-editor-context/hooks"

type VideoExtraProps = {
  isSubmitting: boolean
}

const VideoExtra: React.FC<VideoExtraProps> = ({ isSubmitting }) => {
  const { updatePinContent } = useVideoEditorInfoActions()

  return (
    <>
      <FormGroup disabled>
        <AudienceSelector />
      </FormGroup>

      <FormGroup>
        <PinContentField onChange={pin => updatePinContent(pin)} />
      </FormGroup>

      <FormGroup disabled>
        <VisibilitySelector />
      </FormGroup>
    </>
  )
}

export default VideoExtra
