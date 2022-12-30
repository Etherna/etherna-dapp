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
import { useCallback, useEffect, useRef, useState } from "react"
import { urlOrigin } from "@etherna/api-js/utils"

import useErrorMessage from "./useErrorMessage"
import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { nullablePromise } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

import type { UseUserVideosOptions, VideosSource } from "./useUserVideos"
import type { VideoWithIndexes } from "@/types/video"
import type { Playlist, PlaylistVideo, Video } from "@etherna/api-js"
import type { AxiosError } from "axios"

export type VisibilityStatus = {
  sourceType: "index" | "playlist"
  sourceIdentifier: string
  status: VideoStatus
  errors?: string[]
}

export type VideoStatus = "public" | "processing" | "unindexed" | "error"

type UseUserVideosVisibilityOptions = Omit<
  UseUserVideosOptions,
  "fetchSource" | "limit" | "profile"
>

let playlistResover: (() => Promise<Playlist>) | undefined

export default function useUserVideosVisibility(
  videos: Video[] | undefined,
  opts: UseUserVideosVisibilityOptions
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const address = useUserStore(state => state.address)
  const [isFetchingVisibility, setIsFetchingVisibility] = useState(false)
  const [togglingSource, setTogglingSource] = useState<VideosSource>()
  const [visibility, setVisibility] = useState<Record<string, VisibilityStatus[]>>({})
  const channelPlaylist = useRef<Playlist>()
  const indexClients = useRef<IndexClient[]>()
  const { showError } = useErrorMessage()

  useEffect(() => {
    if (!channelPlaylist.current) {
      const reader = new SwarmPlaylist.Reader(undefined, {
        playlistId: SwarmPlaylist.Reader.channelPlaylistId,
        playlistOwner: address,
        beeClient,
      })

      playlistResover = () => reader.download()
    }

    indexClients.current = opts.sources
      .filter(source => source.type === "index")
      .map(source => new IndexClient((source as VideosSource & { type: "index" }).indexUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    if (videos?.length && !isFetchingVisibility) {
      fetchVideosStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  const getPlaylist = useCallback(async () => {
    if (channelPlaylist.current) return channelPlaylist.current

    const playlist = await playlistResover!()
    channelPlaylist.current = playlist
    return playlist
  }, [])

  const reloadPlaylist = useCallback(async () => {
    const reader = new SwarmPlaylist.Reader(undefined, {
      playlistId: SwarmPlaylist.Reader.channelPlaylistId,
      playlistOwner: address,
      beeClient,
    })
    channelPlaylist.current = await reader.download()
  }, [address, beeClient])

  const fetchVideosStatus = useCallback(async () => {
    if (!videos) return
    setIsFetchingVisibility(true)
    let videosVisibility: typeof visibility = {}

    try {
      const channel = await getPlaylist()

      const results = await Promise.allSettled(
        videos.map(async video => {
          const channelVisibility: VisibilityStatus = {
            sourceType: "playlist",
            sourceIdentifier: SwarmPlaylist.Reader.channelPlaylistId,
            status: channel.videos.some(v => v.reference === video.reference)
              ? "public"
              : "unindexed",
          }
          const indexesResults = await Promise.allSettled(
            indexClients.current!.map(async indexClient => {
              const indexValidation = await nullablePromise(
                indexClient.videos.fetchHashValidation(video.reference)
              )
              const status =
                indexValidation === null
                  ? "unindexed"
                  : indexValidation.isValid === null
                  ? "processing"
                  : indexValidation.isValid
                  ? "public"
                  : "error"
              const indexVisibility: VisibilityStatus = {
                sourceType: "index",
                sourceIdentifier: urlOrigin(indexClient.url)!,
                status,
                errors: indexValidation?.errorDetails.length
                  ? indexValidation?.errorDetails.map(e => e.errorMessage)
                  : undefined,
              }
              return indexVisibility
            })
          )
          const indexesVisibility: VisibilityStatus[] = indexesResults.map((result, i) => {
            if (result.status === "fulfilled") return result.value
            else {
              return {
                sourceType: "index",
                sourceIdentifier: urlOrigin(indexClients.current![i].url)!,
                status: "error",
              }
            }
          })

          return [channelVisibility, ...indexesVisibility]
        })
      )

      videosVisibility = results.reduce((acc, val, i) => {
        if (val.status === "fulfilled") {
          return { ...acc, [videos[i].reference]: val.value }
        }
        return acc
      }, {} as typeof visibility)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetchingVisibility(false)
      setVisibility(videosVisibility)
    }
  }, [videos, getPlaylist])

  const updateVideosStatus = useCallback(
    (videos: VideoWithIndexes[], source: VideosSource, status: VideoStatus) => {
      if (source.type === "index") {
        for (const video of videos) {
          delete video.indexesStatus[source.indexUrl]
        }
      }
      setVisibility(visibility => ({
        ...visibility,
        ...videos.reduce((acc, video) => {
          return {
            ...acc,
            [video.reference]: visibility[video.reference].map(visibility => ({
              ...visibility,
              status:
                (visibility.sourceType === "playlist" && source.type === "channel") ||
                (visibility.sourceType === "index" &&
                  source.type === "index" &&
                  visibility.sourceIdentifier === source.indexUrl)
                  ? status
                  : visibility.status,
            })),
          }
        }, {} as typeof visibility),
      }))
    },
    []
  )

  const addVideosToChannel = useCallback(
    async (videosToAdd: VideoWithIndexes[]) => {
      const playlist = await getPlaylist()
      playlist.videos = [
        ...playlist.videos,
        ...videosToAdd.map(
          video =>
            ({
              reference: video.reference,
              title: video.preview.title,
              addedAt: +new Date(),
            } as PlaylistVideo)
        ),
      ].filter((video, i, self) => self.findIndex(v => v.reference === video.reference) === i)

      const writer = new SwarmPlaylist.Writer(playlist, {
        beeClient,
      })

      await writer.upload()
      await reloadPlaylist()

      updateVideosStatus(videosToAdd, { type: "channel" }, "public")
    },
    [beeClient, getPlaylist, reloadPlaylist, updateVideosStatus]
  )

  const deleteVideosFromChannel = useCallback(
    async (videosToDelete: VideoWithIndexes[]) => {
      const playlist = await getPlaylist()
      playlist.videos = playlist.videos?.filter(
        vid => !videosToDelete.some(vidToDelete => vidToDelete.reference === vid.reference)
      )

      const writer = new SwarmPlaylist.Writer(playlist, {
        beeClient,
      })

      await writer.upload()
      await reloadPlaylist()

      updateVideosStatus(videosToDelete, { type: "channel" }, "unindexed")
    },
    [beeClient, getPlaylist, reloadPlaylist, updateVideosStatus]
  )

  const addVideosToIndex = useCallback(
    async (videos: VideoWithIndexes[], indexUrl: string) => {
      const currentIndexClient = indexClients.current!.find(
        client => urlOrigin(client.url) === indexUrl
      )

      if (!currentIndexClient) return showError(`Cannot add videos from index: '${indexUrl}'`)

      for (const video of videos) {
        try {
          await currentIndexClient.videos.createVideo(video.reference)

          updateVideosStatus([video], { type: "index", indexUrl }, "processing")
        } catch (error) {
          const axiosError = error as AxiosError
          // set title for the error message
          axiosError.name = video.preview.title ?? ""
          throw axiosError
        }
      }
    },
    [showError, updateVideosStatus]
  )

  const deleteVideosFromIndex = useCallback(
    async (videos: VideoWithIndexes[], indexUrl: string) => {
      const currentIndexClient = indexClients.current!.find(
        client => urlOrigin(client.url) === indexUrl
      )

      if (!currentIndexClient) return showError(`Cannot remove videos from index: '${indexUrl}'`)

      for (const video of videos) {
        try {
          let indexId = video.indexesStatus[indexUrl]?.indexReference
          if (!indexId) {
            const indexVideo = await nullablePromise(
              currentIndexClient.videos.fetchVideoFromHash(video.reference)
            )
            indexId = indexVideo?.id
          }
          if (!indexId) {
            return showError(`Cannot remove video from index: '${indexUrl}'. Video not found.`)
          }

          await currentIndexClient.videos.deleteVideo(indexId!)

          updateVideosStatus([video], { type: "index", indexUrl }, "unindexed")
        } catch (error) {
          const axiosError = error as AxiosError
          // set title for the error message
          axiosError.name = video.preview.title ?? ""
          throw axiosError
        }
      }
    },
    [showError, updateVideosStatus]
  )

  const toggleVideosVisibility = useCallback(
    async (
      videos: VideoWithIndexes[],
      source: VideosSource,
      visibility: "published" | "unpublished"
    ) => {
      setTogglingSource(source)
      try {
        if (source.type === "channel" && visibility === "published") {
          await addVideosToChannel(videos)
        } else if (source.type === "channel" && visibility === "unpublished") {
          await deleteVideosFromChannel(videos)
        } else if (source.type === "index" && visibility === "published") {
          await addVideosToIndex(videos, source.indexUrl)
        } else if (source.type === "index" && visibility === "unpublished") {
          await deleteVideosFromIndex(videos, source.indexUrl)
        }
      } catch (error: any) {
        showError(`Cannot delete the video: ${error.name}`, getResponseErrorMessage(error))
      } finally {
        setTogglingSource(undefined)
      }
    },
    [
      addVideosToChannel,
      addVideosToIndex,
      deleteVideosFromChannel,
      deleteVideosFromIndex,
      showError,
    ]
  )

  return {
    isFetchingVisibility,
    visibility,
    togglingSource,
    toggleVideosVisibility,
  }
}
