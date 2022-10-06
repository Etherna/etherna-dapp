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
import type { Playlist, Profile, Video } from "@etherna/api-js"
import { VideoDeserializer } from "@etherna/api-js/serializers"
import { urlOrigin } from "@etherna/api-js/utils"
import type { AxiosError } from "axios"

import useErrorMessage from "./useErrorMessage"
import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import type { VideoWithIndexes } from "@/types/video"
import { nullablePromise, wait } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

export type VisibilityStatus = {
  sourceType: "index" | "playlist"
  sourceIdentifier: string
  status: VideoStatus
  errors?: string[]
}

export type VideoStatus = "public" | "processing" | "unindexed" | "error"

export type VideosSource =
  | {
      type: "channel"
    }
  | {
      type: "index"
      indexUrl: string
    }

export type UseUserVideosOptions = {
  sources: VideosSource[]
  fetchSource: VideosSource
  profile: Profile
  limit?: number
}

let playlistResover: (() => Promise<Playlist>) | undefined

export default function useUserVideos(opts: UseUserVideosOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const address = useUserStore(state => state.address)
  const currentIndexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const [isFetching, setIsFetching] = useState(false)
  const [isFetchingVisibility, setIsFetchingVisibility] = useState(false)
  const [currentPage, setCurrentPage] = useState(-1)
  const [total, setTotal] = useState(0)
  const [videos, setVideos] = useState<VideoWithIndexes[]>()
  const [visibility, setVisibility] = useState<Record<string, VisibilityStatus[]>>({})
  const channelPlaylist = useRef<Playlist>()
  const indexClients = useRef<IndexClient[]>()
  const currentIndexClient = useRef<IndexClient>()
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
  }, [address, opts.sources])

  useEffect(() => {
    setTotal(-1)
    setVideos([])

    const source = opts.fetchSource
    if (source.type === "index") {
      currentIndexClient.current = indexClients.current?.find(
        client => client.url === source.indexUrl
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.fetchSource.type, address])

  const getPlaylist = useCallback(async () => {
    if (channelPlaylist.current) return channelPlaylist.current

    const playlist = await playlistResover!()
    channelPlaylist.current = playlist
    return playlist
  }, [])

  const fetchPlaylistVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      const playlist = await getPlaylist()

      const from = page * limit
      const to = from + limit
      const references = playlist.videos?.slice(from, to) ?? []
      const videos = await Promise.all(
        references.map(async playlistVid => {
          const reader = new SwarmVideo.Reader(playlistVid.reference, {
            beeClient,
          })
          const video = await reader.download()
          return video
        })
      )
      const videosIndexes = videos.filter(Boolean).map<VideoWithIndexes>(video => ({
        ...(video as Video),
        indexesStatus: {},
      }))

      setTotal(videosIndexes.length)

      return videosIndexes
    },
    [beeClient, getPlaylist]
  )

  const fetchIndexVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      const resp = await currentIndexClient.current!.users.fetchVideos(address!, page, limit)

      setTotal(resp.totalElements)

      return resp.elements.map(indexVideo => {
        const videoReader = new SwarmVideo.Reader(indexVideo.lastValidManifest!.hash, {
          beeClient,
        })
        const rawVideo = JSON.stringify(videoReader.indexVideoToRaw(indexVideo))
        const video = new VideoDeserializer(beeClient.url).deserialize(rawVideo, {
          reference: indexVideo.lastValidManifest!.hash,
        })
        const videoIndexes: VideoWithIndexes = {
          ...video,
          indexesStatus: {
            [currentIndexUrl]: {
              indexReference: indexVideo.id,
              totDownvotes: indexVideo.totDownvotes,
              totUpvotes: indexVideo.totUpvotes,
            },
          },
        }
        return videoIndexes
      })
    },
    [address, beeClient, currentIndexUrl]
  )

  const fetchVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      import.meta.env.DEV && wait(1000)

      return opts.fetchSource.type === "channel"
        ? await fetchPlaylistVideos(page, limit)
        : await fetchIndexVideos(page, limit)
    },
    [fetchIndexVideos, fetchPlaylistVideos, opts.fetchSource.type]
  )

  const fetchVideosStatus = useCallback(
    async (videos: Video[]) => {
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
                  sourceIdentifier: indexClient.url,
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
    },
    [getPlaylist]
  )

  const fetchPage = useCallback(
    async (page: number) => {
      const limit = opts.limit || 10
      if (page < 1) throw new Error("Page must be greater than 0")
      if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")

      try {
        setIsFetching(true)
        const newVideos = await fetchVideos(page - 1, limit)
        setVideos(newVideos)
        fetchVideosStatus(newVideos)
      } catch (error: any) {
        setVideos([])
        if (error.response?.status !== 404) {
          showError("Fetching error", getResponseErrorMessage(error))
        }
      } finally {
        setCurrentPage(page)
        setIsFetching(false)
      }
    },
    [opts.limit, fetchVideos, showError, fetchVideosStatus]
  )

  const deleteVideosFromPlaylist = useCallback(
    async (videosToDelete: Video[]) => {
      const playlist = await getPlaylist()
      playlist.videos = playlist.videos?.filter(
        vid => !videosToDelete.some(vidToDelete => vidToDelete.reference === vid.reference)
      )

      const writer = new SwarmPlaylist.Writer(playlist, {
        beeClient,
      })
      writer.upload()
    },
    [beeClient, getPlaylist]
  )

  const deleteVideosFromIndex = useCallback(
    async (videos: VideoWithIndexes[]) => {
      for (const video of videos) {
        try {
          const indexId = video.indexesStatus[currentIndexUrl]?.indexReference
          await currentIndexClient.current!.videos.deleteVideo(indexId!)
        } catch (error) {
          const axiosError = error as AxiosError
          // set title for the error message
          axiosError.name = video.title ?? ""
          throw axiosError
        }
      }
    },
    [currentIndexUrl]
  )

  const deleteVideosFromSource = useCallback(
    async (videos: VideoWithIndexes[]) => {
      try {
        if (opts.fetchSource.type === "channel") {
          await deleteVideosFromPlaylist(videos)
        } else if (opts.fetchSource.type === "index") {
          await deleteVideosFromIndex(videos)
        }
        await fetchPage(currentPage)
      } catch (error: any) {
        showError(`Cannot delete the video: ${error.name}`, getResponseErrorMessage(error))
      }
    },
    [
      currentPage,
      opts.fetchSource.type,
      deleteVideosFromIndex,
      deleteVideosFromPlaylist,
      fetchPage,
      showError,
    ]
  )

  return {
    isFetching,
    isFetchingVisibility,
    total,
    videos,
    visibility,
    fetchPage,
    deleteVideosFromSource,
  }
}
