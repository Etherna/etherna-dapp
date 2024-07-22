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

import ProfileIndexPreview from "./ProfileIndexPreview"
import ProfilePlaylistPreview from "./ProfilePlaylistPreview"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import { useProfileQuery } from "@/queries/profile-query"
import useExtensionsStore from "@/stores/extensions"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

type ProfileChannelProps = {
  address: EthAddress | EnsAddress
}

const ProfileChannel: React.FC<ProfileChannelProps> = ({ address }) => {
  const profileQuery = useProfileQuery({
    address,
  })
  const indexes = useExtensionsStore(state => state.indexesList)

  return (
    <div className="space-y-10">
      <ProfilePlaylistPreview
        address={address}
        identification={{
          id: SwarmPlaylist.Reader.channelPlaylistId,
          owner: address,
        }}
      />

      {indexes.map((index, indexKey) => (
        <ProfileIndexPreview key={indexKey} address={address} url={index.url} />
      ))}

      {profileQuery.data?.details?.playlists?.map((rootManifest, index) => (
        <ProfilePlaylistPreview key={index} address={address} identification={{ rootManifest }} />
      ))}
    </div>
  )
}

export default ProfileChannel
