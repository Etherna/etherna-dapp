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

import React, { useMemo, useState } from "react"

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import { FlagIcon } from "@heroicons/react/24/solid"
import { ReactComponent as ManifestIcon } from "@/assets/icons/manifest.svg"

import VideoExtraMenuManifest from "./VideoExtraMenuManifest"
import VideoExtraMenuReport from "./VideoExtraMenuReport"
import { Dropdown } from "@/components/ui/actions"
import useExtensionsStore from "@/stores/extensions"
import type { VideoWithIndexes } from "@/types/video"

type VideoExtraMenuProps = {
  video: VideoWithIndexes
}

const VideoExtraMenu: React.FC<VideoExtraMenuProps> = ({ video }) => {
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showManifestModal, setShowManifestModal] = useState(false)
  const indexReference = useMemo(() => {
    return video.indexesStatus[indexUrl]?.indexReference
  }, [indexUrl, video.indexesStatus])

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle>
          <EllipsisHorizontalIcon width={26} strokeWidth={2} fill="currentColor" aria-hidden />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            icon={<ManifestIcon aria-hidden />}
            action={() => setShowManifestModal(true)}
          >
            Manifest information
          </Dropdown.Item>
          {indexReference && (
            <Dropdown.Item icon={<FlagIcon aria-hidden />} action={() => setShowReportModal(true)}>
              Report video
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {indexReference && (
        <VideoExtraMenuReport
          show={showReportModal}
          videoId={indexReference}
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
