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

import React, { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"

import { Avatar } from "@/components/ui/display"
import VideoGrid from "@/components/video/VideoGrid"
import usePlaylistVideos from "@/hooks/usePlaylistVideos"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import useUserPlaylists from "@/hooks/useUserPlaylists"
import routes from "@/routes"
import { shortenEthAddr } from "@/utils/ethereum"

import type { VideoWithAll } from "@/types/video"
import type { EthAddress } from "@etherna/sdk-js/clients"

type ProfilePreviewProps = {
  profileAddress: EthAddress
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profileAddress }) => {
  const { profile, loadProfile } = useSwarmProfile({ address: profileAddress })
  const { channelPlaylist, loadPlaylists } = useUserPlaylists(profileAddress, {
    fetchChannel: true,
  })
  const { videos, isFetching, loadMore } = usePlaylistVideos(channelPlaylist, {
    owner: profile ? profile : undefined,
    limit: 5,
  })
  const videosIndexes = useMemo(() => {
    return videos?.map(
      (video, index) =>
        ({
          ...video,
          indexesStatus: {},
          offers: undefined,
        }) as VideoWithAll
    )
  }, [videos])

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    profile && loadPlaylists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => {
    if (profile && channelPlaylist) {
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelPlaylist, profile])

  if (!profile) return null

  return (
    <div className="border-t-4 border-gray-200 py-4 dark:border-gray-800" key={profileAddress}>
      <div className="mb-3 flex items-center">
        <Link to={routes.channel(profileAddress)}>
          <Avatar className="mr-2" image={profile?.avatar} address={profileAddress} />
        </Link>
        <Link className="text-gray-900 dark:text-gray-100" to={routes.channel(profileAddress)}>
          <h3 className="mb-0 text-lg">{profile.name || shortenEthAddr(profileAddress)}</h3>
        </Link>
      </div>
      {videos && (
        <VideoGrid
          videos={videosIndexes}
          mini={true}
          isFetching={isFetching}
          fetchingPreviewCount={5}
        />
      )}
      {videos && !videos.length && <p className="italic text-gray-600">No videos uploaded yet</p>}
    </div>
  )
}

export default ProfilePreview
