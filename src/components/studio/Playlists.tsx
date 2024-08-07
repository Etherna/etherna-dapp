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

import React, { useState } from "react"
import { Navigate } from "react-router-dom"

import PlaylistEditModal from "./playlists/PlaylistEditModal"
import PlaylistsList from "./playlists/PlaylistsLits"
import StudioEditView from "./StudioEditView"
import routes from "@/routes"
import useUserStore from "@/stores/user"

const ChannelPlaylists: React.FC = () => {
  const address = useUserStore(state => state.address)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!address) return <Navigate to={routes.home} />

  return (
    <StudioEditView
      title="Channel playlists"
      saveLabel="Add playlist"
      onSave={async () => setShowCreateModal(true)}
    >
      <PlaylistsList />
      <PlaylistEditModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={() => setShowCreateModal(false)}
      />
    </StudioEditView>
  )
}

export default ChannelPlaylists
