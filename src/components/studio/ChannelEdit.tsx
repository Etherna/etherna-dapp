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
import { Redirect } from "react-router-dom"

import StudioEditView from "./StudioEditView"
import ChannelEditor from "./channel-editor/ChannelEditor"
import CantUploadAlert from "./other/CantUploadAlert"
import useSelector from "@state/useSelector"
import routes from "@routes"

const ChannelEdit: React.FC = () => {
  const address = useSelector(state => state.user.address)
  const saveCallback = useRef<() => Promise<void>>()

  if (!address) return (
    <Redirect to={routes.getHomeLink()} />
  )

  const handleSave = async () => {
    await saveCallback.current?.()
  }

  return (
    <>
      <CantUploadAlert />
      <StudioEditView
        title="Customize channel"
        saveLabel="Save"
        canSave={true}
        onSave={handleSave}
      >
        <ChannelEditor
          profileAddress={address}
          ref={ref => {
            saveCallback.current = ref?.handleSubmit
          }}
        />
      </StudioEditView>
    </>
  )
}

export default ChannelEdit
