import React from "react"

import CustomSelect from "@common/CustomSelect"
import Label from "@common/Label"
import FieldDesrcription from "@common/FieldDesrcription"
import { useVideoEditorState, useVideoEditorExtrasActions } from "@context/video-editor-context/hooks"

const SaveToSelector: React.FC = () => {
  const [{ saveTo }] = useVideoEditorState()
  const { updateSaveTo } = useVideoEditorExtrasActions()

  return (
    <>
      <Label>Save to</Label>
      <CustomSelect
        value={saveTo}
        options={[{
          value: "channel",
          label: "Public Channel",
          description: "Add this video only to your public channel"
        }, {
          value: "channel-index",
          label: "Public Channel + Current Index",
          description: "Add this video only to both your public channel and current index"
        }, {
          value: "none",
          label: "None (private)",
          description: "Don't post the video (share direct link)"
        }]}
        onChange={updateSaveTo}
      />
      <FieldDesrcription>
        Choose where you want to post your video.
      </FieldDesrcription>
    </>
  )
}

export default SaveToSelector
