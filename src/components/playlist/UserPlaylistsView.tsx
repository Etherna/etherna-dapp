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

import React, { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline"

import PlaylistPreview from "./PlaylistPreview"
import PlaylistEditModal from "@/components/modals/PlaylistEditModal"
import PlaylistPreviewPlaceholder from "@/components/placeholders/PlaylistPreviewPlaceholder"
import { Button } from "@/components/ui/actions"
import useSmartFetchCount from "@/hooks/useSmartFetchCount"
import { useUserPlaylistsQuery } from "@/queries/user-playlists-query"
import useUserStore from "@/stores/user"

import type { Playlist, UserPlaylists } from "@etherna/sdk-js"

type UserPlaylistsViewProps = {}

const UserPlaylistsView: React.FC<UserPlaylistsViewProps> = () => {
  const owner = useUserStore(state => state.address ?? "0x0")
  const playlistsQuery = useUserPlaylistsQuery({ owner })
  const gridRef = useRef<HTMLDivElement>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const count = useSmartFetchCount(gridRef, { defaultSeed: 4, rows: 1 }) ?? 4
  const queryClient = useQueryClient()

  const addPlaylist = (playlist: Playlist) => {
    queryClient.setQueryData(useUserPlaylistsQuery.getQueryKey(owner), (data: UserPlaylists) => [
      ...data,
      playlist.reference,
    ])
    playlistsQuery.refetch()

    setShowCreateModal(false)
  }

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-[2560px] flex-col space-y-6">
      <div className="flex w-full">
        <div className="mr-auto">
          <Button color="inverted" onClick={() => setShowCreateModal(true)}>
            Add playlist
          </Button>
        </div>
      </div>

      <div
        ref={gridRef}
        className="grid w-full grid-flow-row-dense grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
      >
        {playlistsQuery.data?.map(playlist => (
          <PlaylistPreview
            identification={{ rootManifest: playlist }}
            owner={owner}
            key={playlist}
          />
        ))}

        {playlistsQuery.isLoading && (
          <>
            {Array.from({ length: count }).map((_, index) => (
              <PlaylistPreviewPlaceholder key={index} />
            ))}
          </>
        )}
      </div>

      {playlistsQuery.isFetched && playlistsQuery.data?.length === 0 && (
        <div className="my-auto flex flex-col items-center">
          <div className="relative mb-6 size-32 rounded-full bg-gradient-to-t from-primary-500/20 to-primary-500/5">
            <DocumentMagnifyingGlassIcon className="opacity-50 absolute-center" width={54} />
          </div>
          <h2 className="text-lg text-gray-500">No playlist found</h2>
        </div>
      )}

      <PlaylistEditModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={addPlaylist}
      />
    </div>
  )
}

export default UserPlaylistsView
