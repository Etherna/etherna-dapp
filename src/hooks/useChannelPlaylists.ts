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
 */

import { useCallback, useMemo } from "react"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { useQueries, useQueryClient } from "@tanstack/react-query"

import useDefaultBatch from "./useDefaultBatch"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import { useChannelPlaylistsQuery } from "@/queries/channel-playlists-query"
import { usePlaylistQuery } from "@/queries/playlist-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { deepCloneObject } from "@/utils/object"

import type { Playlist, PlaylistVideo, Video } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

interface UseUserPlaylistsOptions {
  mode: "channel" | "all"
}

export default function useChannelPlaylists(opts?: UseUserPlaylistsOptions) {
  const owner = useUserStore(state => state.address ?? "0x0")
  const beeClient = useClientsStore(state => state.beeClient)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const { fetchDefaultBatchIdOrCreate } = useDefaultBatch()

  const queryClient = useQueryClient()
  const channelPlaylistQuery = usePlaylistQuery({
    owner,
    playlistIdentification: {
      id: SwarmPlaylist.Reader.channelPlaylistId,
      owner: owner,
    },
  })
  const playlistsQuery = useChannelPlaylistsQuery({ owner })
  const channelPlaylistsQuery = useQueries({
    queries: (playlistsQuery.data ?? []).map(rootManifest =>
      usePlaylistQuery.getQueryConfig({
        owner,
        playlistIdentification: {
          rootManifest,
        },
      })
    ),
  })

  const [channelPlaylist, channelPlaylists] = useMemo(() => {
    return [
      channelPlaylistQuery.isFetching
        ? null
        : channelPlaylistQuery.isSuccess
          ? channelPlaylistQuery.data
          : SwarmPlaylist.Writer.emptyPlaylist(owner, SwarmPlaylist.Reader.channelPlaylistId),
      channelPlaylistsQuery.map(query => query.data).filter(Boolean),
    ]
  }, [
    channelPlaylistQuery.data,
    channelPlaylistQuery.isFetching,
    channelPlaylistQuery.isSuccess,
    channelPlaylistsQuery,
    owner,
  ])

  const isFetchingPlaylists =
    channelPlaylistQuery.isLoading ||
    playlistsQuery.isLoading ||
    channelPlaylistsQuery.some(query => query.isLoading)

  const allPlaylists = useMemo(() => {
    return [channelPlaylist, ...(channelPlaylists ?? [])].filter(Boolean)
  }, [channelPlaylist, channelPlaylists])

  const uploadPlaylist = useCallback(
    async (playlist: Playlist) => {
      const builder = new PlaylistBuilder()
      builder.initialize(playlist.reference, owner, playlist.preview, playlist.details)

      const [, batchId] = await Promise.all([
        builder.loadNode({
          beeClient,
        }),
        fetchDefaultBatchIdOrCreate(),
      ])

      if (!batchId) {
        throw new Error("No batch available")
      }

      const playlistWriter = new SwarmPlaylist.Writer(builder, {
        beeClient,
      })
      return await playlistWriter.upload({ batchId })
    },
    [beeClient, fetchDefaultBatchIdOrCreate, owner]
  )

  const updatePlaylistAndUser = useCallback(
    async (newPlaylist: Playlist) => {
      // update & get new reference
      const updatedPlaylist = await uploadPlaylist(newPlaylist)

      // update raw with new referenc
      if (updatedPlaylist.preview.id === SwarmPlaylist.Reader.channelPlaylistId) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: usePlaylistQuery.getQueryKey({ id: updatedPlaylist.preview.id, owner }),
        })
      } else {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: usePlaylistQuery.getQueryKey({
            rootManifest: updatedPlaylist.preview.rootManifest,
          }),
        })
      }
    },
    [owner, queryClient, uploadPlaylist]
  )

  const replaceVideosInPlaylist = useCallback(
    async (playlistId: string, operations: { remove: Reference; add: Video }[]) => {
      const initialPlaylist = allPlaylists.find(playlist => playlist.preview.id === playlistId)

      if (!initialPlaylist) throw new Error("Playlist not loaded")

      const newPlaylist = deepCloneObject(initialPlaylist)

      for (const operation of operations) {
        const index = newPlaylist.details.videos.findIndex(
          video => video.reference === operation.remove
        )
        const vid: PlaylistVideo = {
          reference: operation.add.reference,
          title: operation.add.preview.title || "",
          addedAt: newPlaylist.details.videos[index].addedAt,
          publishedAt: newPlaylist.details.videos[index].publishedAt,
        }
        if (index >= 0) {
          newPlaylist.details.videos.splice(index, 1, vid)
        } else {
          newPlaylist.details.videos.unshift(vid)
        }
      }

      newPlaylist.details.videos = [...(newPlaylist.details.videos ?? [])].filter(
        (vid, i, self) => self.findIndex(vid2 => vid2.reference === vid.reference) === i
      )

      await updatePlaylistAndUser(newPlaylist)
    },
    [allPlaylists, updatePlaylistAndUser]
  )

  return {
    isFetchingPlaylists,
    channelPlaylist,
    channelPlaylists,
    allPlaylists,
    replaceVideosInPlaylist,
  }
}
