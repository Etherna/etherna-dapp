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
import { VideoDeserializer } from "@etherna/sdk-js/serializers"
import { urlOrigin } from "@etherna/sdk-js/utils"

import useErrorMessage from "./useErrorMessage"
import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import { nullablePromise, wait } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

import type { VideoWithIndexes } from "@/types/video"
import type { Playlist } from "@etherna/sdk-js"
import type { Reference } from "@etherna/sdk-js/clients"

export type VideosSource =
  | {
      type: "playlist"
      id: string
    }
  | {
      type: "index"
      indexUrl: string
    }

export type UseUserVideosOptions = {
  sources: VideosSource[]
  fetchSource: VideosSource
  limit?: number
}

let playlistResolver: (() => Promise<Playlist | null>) | undefined

export default function useUserVideos(opts: UseUserVideosOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const address = useUserStore(state => state.address)
  const currentIndexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)
  const [videos, setVideos] = useState<VideoWithIndexes[]>()
  const playlist = useRef<Playlist | null>()
  const indexClients = useRef<IndexClient[]>()
  const currentIndexClient = useRef<IndexClient>()
  const { showError } = useErrorMessage()

  useEffect(() => {
    if (opts.fetchSource.type === "playlist") {
      playlist.current = undefined
    }

    if (!playlist.current && opts.fetchSource.type === "playlist") {
      const reader = new SwarmPlaylist.Reader(
        { id: opts.fetchSource.id, owner: address! },
        {
          beeClient,
        }
      )

      playlistResolver = () => nullablePromise(reader.download({ mode: "full" }))
    }

    indexClients.current = opts.sources
      .filter(source => source.type === "index")
      .map(source => new IndexClient((source as VideosSource & { type: "index" }).indexUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, opts.sources, opts.fetchSource])

  useEffect(() => {
    setTotal(-1)
    setVideos([])

    const source = opts.fetchSource
    if (source.type === "index") {
      currentIndexClient.current = indexClients.current?.find(
        client => urlOrigin(client.url) === source.indexUrl
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.fetchSource.type, address])

  const getPlaylist = useCallback(async () => {
    if (playlist.current) return playlist.current

    try {
      const downloadedPlaylist = await playlistResolver!()
      playlist.current = downloadedPlaylist
      return downloadedPlaylist
    } catch (error) {
      console.error(error)
      return null
    }
  }, [])

  const fetchPlaylistVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      const playlist = await getPlaylist()

      if (!playlist) {
        return []
      }

      const from = page * limit
      const to = from + limit
      const vids = playlist.details.videos?.slice(from, to) ?? []
      const videos = await Promise.all(
        vids.map(async playlistVid => {
          const reader = new SwarmVideo.Reader(playlistVid.reference, {
            beeClient,
          })
          const video = await reader.download({ mode: "preview" })
          return video
        })
      )
      const videosIndexes = videos.map<VideoWithIndexes>((video, i) => ({
        reference: video?.reference ?? (vids[i]!.reference as Reference),
        preview: video?.preview ?? {
          reference: "" as Reference,
          title: vids[i]!.title,
          createdAt: vids[i]!.addedAt,
          duration: 0,
          ownerAddress: address ?? "0x0",
          thumbnail: null,
          updatedAt: null,
          v: "1.0",
        },
        details: video?.details,
        indexesStatus: {},
      }))

      setTotal(videosIndexes.length)

      return videosIndexes
    },
    [address, beeClient, getPlaylist]
  )

  const fetchIndexVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      const resp = await currentIndexClient.current!.users.fetchVideos(address!, page, limit)

      setTotal(resp.totalElements)

      return resp.elements
        .filter(vid => vid.lastValidManifest)
        .map(indexVideo => {
          try {
            const videoReader = new SwarmVideo.Reader(indexVideo.lastValidManifest!.hash, {
              beeClient,
            })
            const rawVideo = videoReader.indexVideoToRaw(indexVideo)
            const deserializer = new VideoDeserializer(beeClient.url)
            const preview = deserializer.deserializePreview(JSON.stringify(rawVideo.preview), {
              reference: indexVideo.lastValidManifest!.hash,
            })
            const details = deserializer.deserializeDetails(JSON.stringify(rawVideo.details), {
              reference: indexVideo.lastValidManifest!.hash,
            })
            const videoIndexes: VideoWithIndexes = {
              reference: indexVideo.lastValidManifest!.hash as Reference,
              preview,
              details,
              indexesStatus: {
                [currentIndexUrl]: {
                  indexReference: indexVideo.id,
                  totDownvotes: indexVideo.totDownvotes,
                  totUpvotes: indexVideo.totUpvotes,
                  userVote: indexVideo.currentVoteValue,
                },
              },
            }
            return videoIndexes
          } catch (error) {
            const fakeReference = Math.random().toString(36).substring(2) as Reference

            return {
              reference: fakeReference,
              preview: {
                v: "1.0",
                title: "",
                ownerAddress: address!,
                duration: 0,
                reference: fakeReference,
                thumbnail: null,
                createdAt: new Date(),
                updatedAt: null,
              },
              indexesStatus: {
                [currentIndexUrl]: {
                  indexReference: indexVideo.id,
                  totDownvotes: indexVideo.totDownvotes,
                  totUpvotes: indexVideo.totUpvotes,
                  userVote: indexVideo.currentVoteValue,
                },
              },
            } satisfies VideoWithIndexes
          }
        })
    },
    [address, beeClient, currentIndexUrl]
  )

  const fetchVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      import.meta.env.DEV && wait(1000)

      return opts.fetchSource.type === "playlist"
        ? await fetchPlaylistVideos(page, limit)
        : await fetchIndexVideos(page, limit)
    },
    [fetchIndexVideos, fetchPlaylistVideos, opts.fetchSource.type]
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
      } catch (error: any) {
        setVideos([])
        if (error.response?.status !== 404) {
          showError("Fetching error", getResponseErrorMessage(error))
        }
      } finally {
        setIsFetching(false)
      }
    },
    [opts.limit, fetchVideos, showError]
  )

  const invalidate = useCallback(
    async (page: number) => {
      playlist.current = await playlistResolver!()
      await fetchPage(page)
    },
    [fetchPage]
  )

  return {
    isFetching,
    total,
    videos,
    fetchPage,
    invalidate,
  }
}
