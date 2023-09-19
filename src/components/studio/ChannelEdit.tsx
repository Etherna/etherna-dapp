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

import React, { useCallback, useRef } from "react"
import { Navigate } from "react-router-dom"

import ChannelEditor from "./channel-editor/ChannelEditor"
import StudioEditView from "./StudioEditView"
import routes from "@/routes"
import useUserStore from "@/stores/user"

const ChannelEdit: React.FC = () => {
  const defaultBatch = useUserStore(state => state.defaultBatch)
  const address = useUserStore(state => state.address)
  const saveCallback = useRef<() => Promise<void>>()

  const handleSave = useCallback(async () => {
    await saveCallback.current?.()
  }, [])

  if (!address) return <Navigate to={routes.home} />

  return (
    <StudioEditView
      title="Customize channel"
      saveLabel="Save"
      canSave={!!defaultBatch}
      onSave={handleSave}
    >
      <ChannelEditor
        profileAddress={address}
        ref={ref => {
          saveCallback.current = ref?.handleSubmit
        }}
      />
    </StudioEditView>
  )
}

export default ChannelEdit
