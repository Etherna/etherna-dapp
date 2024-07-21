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

import { useCallback, useMemo, useState } from "react"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { useQueries, useQueryClient } from "@tanstack/react-query"

import useChannelPlaylists from "./useChannelPlaylists"
import useDefaultBatch from "./useDefaultBatch"
import useErrorMessage from "./useErrorMessage"
import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import { useIndexValidationQuery } from "@/queries/index-validation-query"
import { usePlaylistQuery } from "@/queries/playlist-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { nullablePromise } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

import type { UseUserVideosOptions, VideosSource } from "./useUserVideos"
import type { VideoWithIndexes } from "@/types/video"
import type { Playlist, PlaylistVideo } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

export type VisibilityStatus = {
  sourceType: "index" | "playlist"
  sourceIdentifier: string
  identifier: string | null
  status: VideoStatus
  errors?: string[]
}

export type VideoStatus = "public" | "processing" | "unindexed" | "error"

type UseUserVideosVisibilityOptions = Omit<
  UseUserVideosOptions,
  "fetchSource" | "limit" | "profile"
>

export default function useUserVideosVisibility(
  videos: VideoWithIndexes[] | undefined,
  opts: UseUserVideosVisibilityOptions
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const address = useUserStore(state => state.address)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const { fetchBestUsableBatch } = useDefaultBatch()
  const [togglingSource, setTogglingSource] = useState<VideosSource>()
  const { showError } = useErrorMessage()

  const indexesUrls = useMemo(() => {
    return opts.sources
      .filter(source => source.type === "index")
      .map(source => (source as VideosSource & { type: "index" }).indexUrl)
  }, [opts.sources])

  const indexesQueryParams = useMemo(() => {
    return (videos ?? []).flatMap(vid =>
      indexesUrls.map(indexUrl => ({ identifier: vid.reference, indexUrl }))
    )
  }, [indexesUrls, videos])

  const queryClient = useQueryClient()
  const { allPlaylists, isFetchingPlaylists } = useChannelPlaylists({ mode: "all" })
  const indexesValidationsQuery = useQueries({
    queries: indexesQueryParams.map(params => useIndexValidationQuery.getQueryConfig(params)),
  })

  const isFetchingVisibility = isFetchingPlaylists || indexesValidationsQuery.some(q => q.isLoading)

  const visibility = useMemo(() => {
    const entries = (videos ?? [])
      .map(vid => {
        const sourcesStatus = opts.sources
          .map<VisibilityStatus | null>(source => {
            if (source.type === "playlist") {
              const playlist = allPlaylists.find(pl => pl.preview.id === source.id)

              if (!playlist) return null

              return {
                sourceType: "playlist",
                sourceIdentifier: source.id,
                identifier: vid.reference,
                status: playlist.details.videos.some(v => v.reference === vid.reference)
                  ? "public"
                  : "unindexed",
              } satisfies VisibilityStatus
            } else {
              const queryIndex = indexesQueryParams.findIndex(
                q => q.identifier === vid.reference && q.indexUrl === source.indexUrl
              )

              if (queryIndex === -1) return null

              const query = indexesValidationsQuery[queryIndex]

              if (query.isLoading) return null

              const status = (() => {
                if (query.isSuccess) {
                  if (query.data.isValid === null) return "processing" as const
                  if (query.data.isValid) return "public" as const
                  return "error" as const
                }

                return "unindexed" as const
              })()

              return {
                sourceType: "index",
                sourceIdentifier: source.indexUrl,
                status,
                errors: query.data?.errorDetails.length
                  ? query.data.errorDetails.map(e => e.errorMessage)
                  : undefined,
                identifier: query.data?.videoId ?? null,
              } satisfies VisibilityStatus
            }
          })
          .filter(Boolean)

        return [vid.reference, sourcesStatus] as const
      })
      .filter(Boolean)

    return Object.fromEntries(entries) satisfies Record<Reference, VisibilityStatus[]>
  }, [videos, opts.sources, allPlaylists, indexesQueryParams, indexesValidationsQuery])

  const savePlaylist = useCallback(
    async (playlist: Playlist) => {
      const builder = new PlaylistBuilder()
      builder.initialize(playlist.reference, address!, playlist.preview, playlist.details)

      const [, batchId] = await Promise.all([
        builder.loadNode({
          beeClient,
        }),
        defaultBatchId
          ? Promise.resolve(defaultBatchId)
          : fetchBestUsableBatch().then(batch => batch?.id),
      ])

      if (!batchId) {
        throw new Error("No batch available")
      }

      const writer = new SwarmPlaylist.Writer(builder, {
        beeClient,
      })

      await writer.upload({ batchId })

      await queryClient.refetchQueries({
        exact: true,
        queryKey: usePlaylistQuery.getQueryKey(
          playlist.preview.id === SwarmPlaylist.Reader.channelPlaylistId
            ? {
                id: playlist.preview.id,
                owner: playlist.preview.owner,
              }
            : {
                rootManifest: playlist.preview.rootManifest,
              }
        ),
      })
    },
    [address, beeClient, defaultBatchId, fetchBestUsableBatch, queryClient]
  )

  const addVideosToPlaylist = useCallback(
    async (playlistId: string, videosToAdd: VideoWithIndexes[]) => {
      const playlist = allPlaylists.find(pl => pl.preview.id === playlistId)

      if (!playlist) {
        return showError(
          `Cannot add videos to playlist: '${playlistId}'`,
          "Playlist not found or not loaded yet"
        )
      }

      playlist.details.videos = [
        ...playlist.details.videos,
        ...videosToAdd.map(
          video =>
            ({
              reference: video.reference,
              title: video.preview.title,
              addedAt: new Date(),
            }) as PlaylistVideo
        ),
      ].filter((video, i, self) => self.findIndex(v => v.reference === video.reference) === i)

      await savePlaylist(playlist)
    },
    [allPlaylists, savePlaylist, showError]
  )

  const deleteVideosFromPlaylist = useCallback(
    async (playlistId: string, videosToDelete: VideoWithIndexes[]) => {
      const playlist = allPlaylists.find(pl => pl.preview.id === playlistId)

      if (!playlist) {
        return showError(
          `Cannot add videos to playlist: '${playlistId}'`,
          "Playlist not found or not loaded yet"
        )
      }

      playlist.details.videos = playlist.details.videos.filter(
        vid => !videosToDelete.some(vidToDelete => vidToDelete.reference === vid.reference)
      )

      await savePlaylist(playlist)
    },
    [allPlaylists, savePlaylist, showError]
  )

  const addVideosToIndex = useCallback(
    async (indexUrl: string, videos: VideoWithIndexes[]) => {
      const indexClient = new IndexClient(indexUrl)

      await Promise.all(
        videos.map(async video => {
          await indexClient.videos.createVideo(video.reference)
          await queryClient.refetchQueries({
            exact: true,
            queryKey: useIndexValidationQuery.getQueryKey({
              indexUrl,
              identifier: video.reference,
            }),
          })
        })
      )
    },
    [queryClient]
  )

  const deleteVideosFromIndex = useCallback(
    async (indexUrl: string, videos: VideoWithIndexes[]) => {
      const indexClient = new IndexClient(indexUrl)

      await Promise.all(
        videos.map(async video => {
          let indexId = video.indexesStatus[indexUrl]?.indexReference
          if (!indexId) {
            const indexVideo = await nullablePromise(
              indexClient.videos.fetchVideoFromHash(video.reference)
            )
            indexId = indexVideo?.id
          }

          if (!indexId) {
            throw new Error(`Cannot remove video from index: '${indexUrl}'. Video not found.`)
          }

          await indexClient.videos.deleteVideo(indexId!)

          await queryClient.refetchQueries({
            exact: true,
            queryKey: useIndexValidationQuery.getQueryKey({
              indexUrl,
              identifier: video.reference,
            }),
          })
        })
      )
    },
    [queryClient]
  )

  const toggleVideosVisibility = useCallback(
    async (
      videos: VideoWithIndexes[],
      source: VideosSource,
      visibility: "published" | "unpublished"
    ) => {
      setTogglingSource(source)
      try {
        if (source.type === "playlist" && visibility === "published") {
          await addVideosToPlaylist(source.id, videos)
        } else if (source.type === "playlist" && visibility === "unpublished") {
          await deleteVideosFromPlaylist(source.id, videos)
        } else if (source.type === "index" && visibility === "published") {
          await addVideosToIndex(source.indexUrl, videos)
        } else if (source.type === "index" && visibility === "unpublished") {
          await deleteVideosFromIndex(source.indexUrl, videos)
        }
      } catch (error: any) {
        const actionName = (() => {
          switch (visibility) {
            case "published":
              return "add"
            case "unpublished":
              return "delete"
          }
        })()
        showError(`Cannot ${actionName} the video`, getResponseErrorMessage(error))
      } finally {
        setTogglingSource(undefined)
      }
    },
    [
      addVideosToPlaylist,
      addVideosToIndex,
      deleteVideosFromPlaylist,
      deleteVideosFromIndex,
      showError,
    ]
  )

  const invalidate = useCallback(async () => {
    await Promise.all([
      ...allPlaylists.map(playlist =>
        queryClient.invalidateQueries({
          exact: true,
          queryKey: usePlaylistQuery.getQueryKey(
            playlist.preview.id === SwarmPlaylist.Reader.channelPlaylistId
              ? {
                  id: playlist.preview.id,
                  owner: playlist.preview.owner,
                }
              : {
                  rootManifest: playlist.preview.rootManifest,
                }
          ),
        })
      ),
      ...indexesQueryParams.map(params =>
        queryClient.invalidateQueries({
          exact: true,
          queryKey: useIndexValidationQuery.getQueryKey(params),
        })
      ),
    ])
  }, [allPlaylists, indexesQueryParams, queryClient])

  return {
    isFetchingVisibility,
    visibility,
    togglingSource,
    toggleVideosVisibility,
    invalidate,
  }
}
