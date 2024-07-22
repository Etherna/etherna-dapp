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
import { useNavigate } from "react-router-dom"

import BeeAuthModal from "./BeeAuthModal"
import ExtensionEditorModal from "./ExtensionEditorModal"
import ImageCropModal from "./ImageCropModal"
import PlaylistEditModal from "./PlaylistEditModal"
import ShortcutModal from "./ShortcutModal"
import routes from "@/routes"
import useUIStore from "@/stores/ui"

const ModalsSection: React.FC = () => {
  const navigate = useNavigate()
  const shortcut = useUIStore(state => state.shortcut)
  const cropping = useUIStore(state => state.cropping)
  const isAuthenticatingBee = useUIStore(state => state.isAuthenticatingBee)
  const showPlaylistCreation = useUIStore(state => state.showPlaylistCreation)
  const togglePlaylistCreation = useUIStore(state => state.togglePlaylistCreation)

  return (
    <section id="modals">
      <ShortcutModal show={!!shortcut} />

      <ImageCropModal show={!!cropping} />

      <BeeAuthModal show={isAuthenticatingBee} />

      <PlaylistEditModal
        show={showPlaylistCreation}
        onSave={playlist => {
          navigate(routes.playlist(playlist.preview.rootManifest))
          togglePlaylistCreation(false)
        }}
        onClose={() => togglePlaylistCreation(false)}
      />

      <ExtensionEditorModal />
    </section>
  )
}

export default ModalsSection
