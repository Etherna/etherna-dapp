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

import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { ReactComponent as PlaylistIcon } from "@/assets/icons/navigation/playlists.svg"

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
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import PlaylistSubscribeButton from "@/components/playlist/PlaylistSubscribeButton"
import { Skeleton } from "@/components/ui/display"
import { usePlaylistQuery } from "@/queries/playlist-query"
import routes from "@/routes"
import { cn } from "@/utils/classnames"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"

interface ProfilePlaylistPreviewProps {
  address: EthAddress | EnsAddress
  identification: PlaylistIdentification
}

const ProfilePlaylistPreview: React.FC<ProfilePlaylistPreviewProps> = ({
  address,
  identification,
}) => {
  const isChannel =
    "id" in identification && identification.id === SwarmPlaylist.Reader.channelPlaylistId
  const playlistId = (
    "id" in identification ? identification.id : identification.rootManifest
  ).toLowerCase()

  const playlistQuery = usePlaylistQuery({
    playlistIdentification: identification,
    fillEmptyState: isChannel,
  })

  return (
    <ProfileSource>
      <ProfileSourceHeader
        className={cn({
          "text-red-500": playlistQuery.isError,
        })}
      >
        <ProfileSourceHeaderSection variant="fill">
          <ProfileSourceTitle>
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
          </ProfileSourceTitle>
          <ProfileSourceDescription>
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
            {playlistQuery.isSuccess && (
              <span> - {playlistQuery.data.details.videos.length} videos</span>
            )}
          </ProfileSourceDescription>
        </ProfileSourceHeaderSection>
        {"rootManifest" in identification && (
          <ProfileSourceHeaderSection variant="fit">
            <PlaylistSubscribeButton rootManifest={identification.rootManifest} small />
          </ProfileSourceHeaderSection>
        )}
      </ProfileSourceHeader>
      <ProfileSourceContent>
        <ProfileSourceVideos
          address={address}
          source={playlistQuery.data ? { type: "playlist", data: playlistQuery.data } : undefined}
          isLoading={playlistQuery.isLoading}
          error={playlistQuery.error}
          variant="preview"
          rows={isChannel ? 2 : 1}
        />

        {playlistQuery.isSuccess && playlistQuery.data.details.videos.length === 0 && (
          <ProfileSourceEmptyMessage>
            {isChannel && "No videos found in this channel"}
            {!isChannel && "No videos found in this playlist"}
          </ProfileSourceEmptyMessage>
        )}
      </ProfileSourceContent>
      {playlistQuery.isSuccess && playlistQuery.data.details.videos.length > 0 && (
        <ProfileSourceFooter>
          <ProfileSourceLoadMore to={routes.channelPlaylist(address, playlistId)}>
            View all →
          </ProfileSourceLoadMore>
        </ProfileSourceFooter>
      )}
    </ProfileSource>
  )
}

export default ProfilePlaylistPreview
