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

import React from "react"

import CustomSelect from "@/components/common/CustomSelect"
import Label from "@/components/common/Label"
import FieldDesrcription from "@/components/common/FieldDesrcription"
import { useVideoEditorState, useVideoEditorExtrasActions } from "@/context/video-editor-context/hooks"

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
