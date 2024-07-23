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
import { urlHostname } from "@etherna/sdk-js/utils"

import { ReactComponent as IndexIcon } from "@/assets/icons/navigation/index.svg"

import ProfileSourceVideos from "./ProfileSourceVideos"
import {
  ProfileVideosHeader,
  ProfileVideosHeaderBack,
  ProfileVideosHeaderContent,
  ProfileVideosHeaderDescription,
  ProfileVideosHeaderSection,
  ProfileVideosHeaderTitle,
} from "./ProfileVideosHeader"
import routes from "@/routes"
import useExtensionsStore from "@/stores/extensions"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

type ProfileChannelIndexVideosProps = {
  address: EthAddress | EnsAddress
  host: string
}

const ProfileChannelIndexVideos: React.FC<ProfileChannelIndexVideosProps> = ({ address, host }) => {
  const indexUrl = useExtensionsStore(
    state =>
      state.indexesList.find(index => urlHostname(index.url) === host)?.url ?? `https://${host}`
  )

  return (
    <div className="space-y-10">
      <ProfileVideosHeader>
        <ProfileVideosHeaderBack to={routes.channel(address)} />
        <ProfileVideosHeaderContent>
          <ProfileVideosHeaderSection variant="fill">
            <ProfileVideosHeaderTitle>
              <IndexIcon className="mr-2" width={16} />
              <span>Index {host}</span>
            </ProfileVideosHeaderTitle>
            <ProfileVideosHeaderDescription>
              Videos list provided by the {host} index
            </ProfileVideosHeaderDescription>
          </ProfileVideosHeaderSection>
        </ProfileVideosHeaderContent>
      </ProfileVideosHeader>

      <ProfileSourceVideos address={address} source={{ type: "index", url: indexUrl }} />
    </div>
  )
}

export default ProfileChannelIndexVideos
