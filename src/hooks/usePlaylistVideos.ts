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

import useErrorMessage from "./useErrorMessage"
import useSmartFetchCount from "./useSmartFetchCount"
import BeeClient from "@/classes/BeeClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import { getResponseErrorMessage } from "@/utils/request"

import type { WithOwner } from "@/types/video"
import type { Playlist, Profile, Video } from "@etherna/api-js"
import type { EthAddress } from "@etherna/api-js/clients"

type VideoWithOwner = WithOwner<Video>

type PlaylistVideosOptions = {
  gridRef?: React.RefObject<HTMLElement>
  owner?: Profile | null
  limit?: number
}

export default function usePlaylistVideos(
  playlistReference: Playlist | string | undefined,
  opts: PlaylistVideosOptions = { limit: -1 }
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const [playlist, setPlaylist] = useState<Playlist | undefined>(
    typeof playlistReference === "string" ? undefined : playlistReference
  )
  const [videos, setVideos] = useState<VideoWithOwner[]>()
  const [isFetching, setIsFetching] = useState(false)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string>()
  const [isEncrypted, setIsEncrypted] = useState(playlist?.type === "private" && !playlist.videos)
  const fetchingPage = useRef<number>()
  const smartFetchCount = useSmartFetchCount(opts.gridRef)

  useEffect(() => {
    if (opts.owner) return

    setVideos(undefined)
    setHasMore(false)
    setIsEncrypted(false)
  }, [playlistReference, opts.owner])

  useEffect(() => {
    if (playlist) {
      setHasMore((playlist.videos ?? []).length > 0)
      setIsEncrypted(playlist.type === "private" && !playlist.videos)
    }
  }, [playlist])

  const applyOwnerToVideos = useCallback(
    (videos: Video[]): VideoWithOwner[] => {
      if (!opts.owner) return videos as VideoWithOwner[]

      return videos.map(
        video =>
          ({
            ...video,
            owner: opts.owner,
          } as VideoWithOwner)
      )
    },
    [opts.owner]
  )

  const loadPlaylist = useCallback(async () => {
    if (typeof playlistReference !== "string") return
    if (!opts.owner) return

    setTotal(0)
    setVideos(undefined)
    setError(undefined)

    setIsLoadingPlaylist(true)

    const isReference = BeeClient.isValidHash(playlistReference)
    const reference = isReference ? playlistReference : undefined
    const id = isReference ? undefined : playlistReference

    try {
      const reader = new SwarmPlaylist.Reader(reference, {
        beeClient,
        playlistId: id,
        playlistOwner: opts.owner?.address as EthAddress,
      })

      const playlist = await reader.download()
      setPlaylist(playlist)
    } catch (error: any) {
      if (error.response.status === 404) return

      setError("Error loading channel. Response: " + getResponseErrorMessage(error))
    } finally {
      setIsLoadingPlaylist(false)
    }
  }, [beeClient, opts.owner, playlistReference])

  const fetchVideos = useCallback(
    async (from: number, to: number): Promise<Video[]> => {
      if (!playlist?.videos) {
        setIsFetching(false)
        return []
      }

      setError(undefined)
      setTotal(playlist.videos.length)
      setIsFetching(true)

      try {
        const references = playlist.videos.slice(from, to)
        const newVideos = await Promise.all(
          references.map(video => {
            const reader = new SwarmVideo.Reader(video.reference, {
              beeClient,
              indexClient,
            })
            return reader.download({ mode: "preview" })
          })
        )

        return applyOwnerToVideos(newVideos.filter(Boolean) as Video[])
      } catch (error) {
        console.error(error)

        setError("Fetching error. Response: " + "Coudn't fetch playlist videos")
        return []
      } finally {
        setIsFetching(false)
      }
    },
    [beeClient, indexClient, playlist, applyOwnerToVideos]
  )

  const fetchPage = useCallback(
    async (page: number) => {
      if (fetchingPage.current === page) return

      const limit = opts.limit
      if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")
      const from = (page - 1) * limit
      const to = from + limit

      fetchingPage.current = page
      const newVideos = await fetchVideos(from, to)
      setVideos(applyOwnerToVideos(newVideos))
      fetchingPage.current = undefined
    },
    [applyOwnerToVideos, fetchVideos, opts.limit]
  )

  const loadMore = useCallback(async () => {
    if (isFetching) return
    if (!hasMore) {
      setIsFetching(false)
      return
    }

    if (playlist?.videos == null) return

    const limit = smartFetchCount || 9
    const from = videos?.length ?? 0
    const to = from + (limit === -1 ? playlist.videos.length ?? 0 : limit)
    const newVideos = await fetchVideos(from, to)
    setHasMore(to < playlist.videos.length)
    setVideos(applyOwnerToVideos([...(videos ?? []), ...newVideos]))
  }, [applyOwnerToVideos, fetchVideos, hasMore, isFetching, smartFetchCount, playlist, videos])

  return {
    playlist,
    videos,
    total,
    error,
    isFetching,
    isLoadingPlaylist,
    isEncrypted,
    hasMore,
    smartFetchCount,
    loadPlaylist,
    loadMore,
    fetchPage,
  }
}
