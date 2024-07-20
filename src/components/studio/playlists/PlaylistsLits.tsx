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
import { ProfileBuilder } from "@etherna/sdk-js/swarm"
import { EmptyReference } from "@etherna/sdk-js/utils"
import { useQueryClient } from "@tanstack/react-query"

import PlaylistEditModal from "./PlaylistEditModal"
import PlaylistsListItem from "./PlaylistListItem"
import SwarmProfile from "@/classes/SwarmProfile"
import { Alert, Skeleton } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { useChannelPlaylistsQuery } from "@/queries/channel-playlists-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { Playlist } from "@etherna/sdk-js"

type PlaylistsListProps = {}

const PlaylistsList: React.FC<PlaylistsListProps> = ({}) => {
  const owner = useUserStore(state => state.address ?? "0x0")
  const profile = useUserStore(state => state.profile)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const beeClient = useClientsStore(state => state.beeClient)
  const { fetchBestUsableBatch } = useDefaultBatch({
    autofetch: !defaultBatchId,
    saveAfterCreate: false,
  })
  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()
  const queryClient = useQueryClient()
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist>()

  const playlistsQuery = useChannelPlaylistsQuery({ owner })

  const handleRemovePlaylist = async (playlist: Playlist) => {
    const proceed = await waitConfirmation(
      "Are you sure you want to remove this playlist?",
      "",
      "Remove",
      "destructive"
    )

    if (!proceed) {
      return
    }

    try {
      let batchId = defaultBatchId

      if (!batchId) {
        const batch = await fetchBestUsableBatch()
        batchId = batch?.id
      }

      if (!batchId) {
        showError("Default postage batch not loaded or not created yet")
        return
      }

      const profileReader = new SwarmProfile.Reader(owner, {
        beeClient,
        prefetchData: profile ? { preview: profile } : undefined,
      })

      const profileResponse = await profileReader.download({ mode: "full" })

      const profileBuilder = new ProfileBuilder()
      profileBuilder.initialize(
        profileResponse?.reference ?? EmptyReference,
        profileResponse?.preview ?? {
          name: "",
          avatar: null,
          address: owner,
          batchId,
        },
        profileResponse?.details
      )

      profileBuilder.removePlaylist(playlist.preview.rootManifest)

      const profileWriter = new SwarmProfile.Writer(profileBuilder, {
        beeClient,
      })

      await profileWriter.upload({
        batchId,
      })

      await queryClient.invalidateQueries({
        exact: true,
        queryKey: useChannelPlaylistsQuery.getQueryKey(owner),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <ul className="flex flex-col space-y-1">
        {playlistsQuery.isLoading && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="block h-20 w-full" />
            ))}
          </>
        )}
        {playlistsQuery.isError && (
          <Alert color="error">An error occurred while fetching the playlists</Alert>
        )}
        {playlistsQuery.data?.map(playlist => (
          <PlaylistsListItem
            key={playlist}
            rootManifest={playlist}
            onEdit={setEditingPlaylist}
            onRemove={handleRemovePlaylist}
          />
        ))}
      </ul>

      <PlaylistEditModal
        open={!!editingPlaylist}
        playlist={editingPlaylist}
        onClose={() => setEditingPlaylist(undefined)}
        onSave={() => setEditingPlaylist(undefined)}
      />
    </>
  )
}

export default PlaylistsList
