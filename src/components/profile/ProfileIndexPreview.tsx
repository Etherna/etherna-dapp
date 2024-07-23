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
import { urlHostname } from "@etherna/sdk-js/utils"

import { ReactComponent as IndexIcon } from "@/assets/icons/navigation/index.svg"

import {
  ProfileSource,
  ProfileSourceContent,
  ProfileSourceDescription,
  ProfileSourceEmptyMessage,
  ProfileSourceFooter,
  ProfileSourceHeader,
  ProfileSourceHeaderSection,
  ProfileSourceLoadMore,
  ProfileSourceTitle,
} from "./ProfileSource"
import ProfileSourceVideos from "./ProfileSourceVideos"
import routes from "@/routes"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

interface ProfileIndexPreviewProps {
  address: EthAddress | EnsAddress
  url: string
}

const ProfileIndexPreview: React.FC<ProfileIndexPreviewProps> = ({ address, url }) => {
  const hostname = urlHostname(url)!
  const [hasSomeVideos, setHasSomeVideos] = useState<boolean>()

  return (
    <ProfileSource>
      <ProfileSourceHeader>
        <ProfileSourceHeaderSection variant="fill">
          <ProfileSourceTitle>
            <IndexIcon className="mr-2" width={16} />
            <span>Index {hostname}</span>
          </ProfileSourceTitle>
          <ProfileSourceDescription>
            Videos list provided by the {hostname} index
          </ProfileSourceDescription>
        </ProfileSourceHeaderSection>
      </ProfileSourceHeader>
      <ProfileSourceContent>
        <ProfileSourceVideos
          address={address}
          source={{ type: "index", url }}
          variant="preview"
          rows={2}
          onVideosFetched={videos => setHasSomeVideos(videos.length > 0)}
        />

        {hasSomeVideos === false && (
          <ProfileSourceEmptyMessage>No videos found on this index</ProfileSourceEmptyMessage>
        )}
      </ProfileSourceContent>

      {hasSomeVideos && (
        <ProfileSourceFooter>
          <ProfileSourceLoadMore to={routes.channelIndex(address, hostname)}>
            View all →
          </ProfileSourceLoadMore>
        </ProfileSourceFooter>
      )}
    </ProfileSource>
  )
}

export default ProfileIndexPreview
