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

import { PlusCircleIcon } from "@heroicons/react/24/outline"

import VideoDetailsButton from "./VideoDetailsButton"
import SaveToModal from "@/components/modals/SaveToModal"

import type { Video } from "@etherna/sdk-js"

type VideoSaveToProps = {
  video: Video | null | undefined
}

const VideoSaveTo: React.FC<VideoSaveToProps> = ({ video }) => {
  const [showPlaylistsModal, setShowPlaylistsModal] = useState(false)

  return (
    <>
      <VideoDetailsButton
        icon={<PlusCircleIcon width={20} aria-hidden />}
        onClick={() => setShowPlaylistsModal(true)}
        disabled={!video}
      >
        Save
      </VideoDetailsButton>

      {video && (
        <SaveToModal
          show={showPlaylistsModal}
          video={video}
          onClose={() => setShowPlaylistsModal(false)}
        />
      )}
    </>
  )
}

export default VideoSaveTo
