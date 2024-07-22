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

import { ExclamationCircleIcon } from "@heroicons/react/24/solid"
import { ReactComponent as PlaylistIcon } from "@/assets/icons/navigation/playlists.svg"

import ProfileSourceVideos from "./ProfileSourceVideos"
import {
  ProfileVideosHeader,
  ProfileVideosHeaderBack,
  ProfileVideosHeaderContent,
  ProfileVideosHeaderDescription,
  ProfileVideosHeaderTitle,
} from "./ProfileVideosHeader"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import { Skeleton } from "@/components/ui/display"
import { usePlaylistQuery } from "@/queries/playlist-query"
import routes from "@/routes"

import type { EnsAddress, EthAddress, Reference } from "@etherna/sdk-js/clients"

type ProfileChannelPlaylistVideosProps = {
  address: EthAddress | EnsAddress
  playlistId: string
}

const ProfileChannelPlaylistVideos: React.FC<ProfileChannelPlaylistVideosProps> = ({
  address,
  playlistId,
}) => {
  const isChannel =
    playlistId.toLowerCase() === SwarmPlaylist.Reader.channelPlaylistId.toLowerCase()
  const playlistQuery = usePlaylistQuery({
    playlistIdentification: isChannel
      ? {
          id: SwarmPlaylist.Reader.channelPlaylistId,
          owner: address,
        }
      : { rootManifest: playlistId as Reference },
  })

  return (
    <div className="space-y-10">
      <ProfileVideosHeader>
        <ProfileVideosHeaderBack to={routes.channel(address)} />
        <ProfileVideosHeaderContent>
          <ProfileVideosHeaderTitle>
            <PlaylistIcon className="mr-2" width={16} />
            <span>
              {isChannel && "All channel videos"}
              {!isChannel && (
                <>
                  {(() => {
                    switch (playlistQuery.status) {
                      case "success":
                        return playlistQuery.data.preview.name
                      case "pending":
                        return <Skeleton className="block h-5 w-44" />
                      case "error":
                        return (
                          <span className="inline-flex items-center space-x-2">
                            <ExclamationCircleIcon width={16} />
                            <span>{"Coudn't load playlist"}</span>
                          </span>
                        )
                    }
                  })()}
                </>
              )}
            </span>
          </ProfileVideosHeaderTitle>
          <ProfileVideosHeaderDescription>
            {isChannel && "Decentralized videos feed"}
            {!isChannel && (
              <>
                {(() => {
                  switch (playlistQuery.status) {
                    case "success":
                      return playlistQuery.data.details.description
                    case "pending":
                      return <Skeleton className="block h-4 w-full max-w-52" />
                    case "error":
                      return (
                        <span className="inline-flex items-center space-x-2">
                          <ExclamationCircleIcon width={16} />
                          <span>{playlistQuery.error.message || "Unknown error"}</span>
                        </span>
                      )
                  }
                })()}
              </>
            )}
          </ProfileVideosHeaderDescription>
        </ProfileVideosHeaderContent>
      </ProfileVideosHeader>

      <ProfileSourceVideos
        address={address}
        source={playlistQuery.data ? { type: "playlist", data: playlistQuery.data } : undefined}
        isLoading={playlistQuery.isLoading}
      />
    </div>
  )
}

export default ProfileChannelPlaylistVideos
