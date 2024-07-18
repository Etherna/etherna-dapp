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

import { useCallback, useEffect, useState } from "react"
import { EmptyReference } from "@etherna/sdk-js/utils"

import { useCursorPagination } from "./useCursorPagination"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmProfile from "@/classes/SwarmProfile"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import { getResponseErrorMessage } from "@/utils/request"

import type { WithOwner } from "@/types/video"
import type { Playlist, Video } from "@etherna/sdk-js"
import type { EthAddress, Reference } from "@etherna/sdk-js/clients"

type VideoWithOwner = WithOwner<Video>

type PlaylistVideosOptions = {
  seedLimit?: number
  loadMoreLimit?: number
}

type PlaylistEntry = Playlist | { id: string; owner: EthAddress } | { rootManifest: Reference }

const isPlaylist = (entry: PlaylistEntry): entry is Playlist => {
  return "preview" in entry && "details" in entry
}

export default function usePlaylistVideos(
  playlistEntry: Playlist | { id: string; owner: EthAddress } | { rootManifest: Reference },
  opts: PlaylistVideosOptions
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const [playlist, setPlaylist] = useState<Playlist | undefined>(
    isPlaylist(playlistEntry) ? playlistEntry : undefined
  )
  const [videos, setVideos] = useState<(VideoWithOwner | null)[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string>()

  const { cursor, hasMore, next } = useCursorPagination({
    total,
    seedCount: opts.seedLimit,
    nextCount: opts.loadMoreLimit,
  })

  useEffect(() => {
    setTotal(playlist?.details.videos.length ?? 0)
    setVideos([])
  }, [playlist])

  useEffect(() => {
    if (!playlist) return
    if (cursor.end === 0) return

    const from = cursor.start
    const to = cursor.end

    fetchVideos(from, to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor.start, cursor.end])

  const loadVideosOwners = useCallback(
    async (videos: Video[]) => {
      const addresses = Array.from(new Set(videos.map(video => video.preview.ownerAddress)))
      const profiles = addresses.map(async address => {
        const reader = new SwarmProfile.Reader(address, { beeClient })
        return reader.download({ mode: "preview" })
      })

      const results = (await Promise.allSettled(profiles)).map(res =>
        res.status === "fulfilled" ? res.value : null
      )

      setVideos(videos =>
        videos.map(video =>
          video
            ? {
                ...video,
                owner:
                  results.find(
                    profile => profile?.preview.address === video.preview.ownerAddress
                  ) ?? video.owner,
              }
            : null
        )
      )
    },
    [beeClient]
  )

  const loadPlaylist = useCallback(async () => {
    setTotal(0)
    setVideos([])
    setError(undefined)

    if (isPlaylist(playlistEntry)) {
      setPlaylist(playlistEntry)
      return
    }

    setIsLoadingPlaylist(true)

    try {
      const reader = new SwarmPlaylist.Reader(playlistEntry, {
        beeClient,
      })

      const playlist = await reader.download({ mode: "full" })
      setPlaylist(playlist)
    } catch (error: any) {
      if (error.response.status === 404) return

      setError("Error loading playlist. Response: " + getResponseErrorMessage(error))
    } finally {
      setIsLoadingPlaylist(false)
    }
  }, [beeClient, playlistEntry])

  const fetchVideos = useCallback(
    async (from: number, to: number) => {
      if (!playlist?.details.videos) {
        setIsFetching(false)
        return []
      }

      setError(undefined)
      setTotal(playlist.details.videos.length)
      setIsFetching(true)

      try {
        const references = playlist.details.videos.slice(from, to)
        const newVideos = await Promise.all(
          references.map(video => {
            const reader = new SwarmVideo.Reader(video.reference, {
              beeClient,
              indexClient,
            })
            return reader.download({ mode: "preview" })
          })
        )

        setVideos(videos => {
          return [
            ...videos,
            ...newVideos.map(vid =>
              vid
                ? ({
                    ...vid,
                    owner: {
                      preview: {
                        address: vid.preview.ownerAddress,
                        name: "",
                        avatar: null,
                        batchId: null,
                      },
                      ens: null,
                      reference: EmptyReference,
                    },
                  } satisfies VideoWithOwner)
                : null
            ),
          ]
        })

        loadVideosOwners(newVideos.filter(Boolean))
      } catch (error) {
        console.error(error)

        setError("Fetching error. Response: " + "Coudn't fetch playlist videos")
        return []
      } finally {
        setIsFetching(false)
      }
    },
    [beeClient, indexClient, loadVideosOwners, playlist]
  )

  const loadMore = useCallback(async () => {
    if (isFetching) return
    if (!hasMore) {
      setIsFetching(false)
      return
    }

    next()
  }, [isFetching, hasMore, next])

  return {
    playlist,
    videos,
    total,
    error,
    isFetching,
    isLoadingPlaylist,
    hasMore,
    loadPlaylist,
    loadMore,
  }
}
