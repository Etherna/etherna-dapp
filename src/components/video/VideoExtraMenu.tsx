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

import { FlagIcon, DotsVerticalIcon } from "@heroicons/react/solid"
import { ReactComponent as ManifestIcon } from "@/assets/icons/manifest.svg"

import VideoExtraMenuManifest from "./VideoExtraMenuManifest"
import VideoExtraMenuReport from "./VideoExtraMenuReport"
import { Dropdown } from "@/components/ui/actions"
import type { Video } from "@/definitions/swarm-video"

type VideoExtraMenuProps = {
  video: Video
}

const VideoExtraMenu: React.FC<VideoExtraMenuProps> = ({ video }) => {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showManifestModal, setShowManifestModal] = useState(false)

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle>
          <DotsVerticalIcon className="w-5 h-5 rotate-90" aria-hidden />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            icon={<ManifestIcon aria-hidden />}
            action={() => setShowManifestModal(true)}
          >
            Manifest information
          </Dropdown.Item>
          {video.indexReference && (
            <Dropdown.Item icon={<FlagIcon aria-hidden />} action={() => setShowReportModal(true)}>
              Report video
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {video.indexReference && (
        <VideoExtraMenuReport
          show={showReportModal}
          videoId={video.indexReference}
          videoReference={video.reference}
          setShow={setShowReportModal}
        />
      )}
      <VideoExtraMenuManifest
        show={showManifestModal}
        video={video}
        setShow={setShowManifestModal}
      />
    </>
  )
}

export default VideoExtraMenu
