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
import { parsePlaylistIdFromTopic } from "@etherna/sdk-js/swarm"

import BeeClient from "@/classes/BeeClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import { getResponseErrorMessage } from "@/utils/request"

import type { WithOwner } from "@/types/video"
import type { Playlist, Profile, Video } from "@etherna/sdk-js"
import type { EthAddress, Reference } from "@etherna/sdk-js/clients"

type VideoWithOwner = WithOwner<Video>

type PlaylistVideosOptions = {
  owner?: Profile | null
  seedLimit?: number
  loadMoreLimit?: number
}

export default function usePlaylistVideos(
  identification: { id: string; owner: EthAddress } | Reference,
  opts: PlaylistVideosOptions
) {
  const beeClient = useClientsStore(state => state.beeClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const [playlist, setPlaylist] = useState<Playlist>()
  const [videos, setVideos] = useState<VideoWithOwner[]>()
  const [isFetching, setIsFetching] = useState(false)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string>()
  const [isEncrypted, setIsEncrypted] = useState(playlist?.type === "private" && !playlist.videos)
  const fetchingPage = useRef<number>()

  useEffect(() => {
    if (opts.owner) return

    setVideos(undefined)
    setHasMore(false)
    setIsEncrypted(false)
  }, [identification, opts.owner])

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
          }) as VideoWithOwner
      )
    },
    [opts.owner]
  )

  const loadPlaylist = useCallback(async () => {
    setTotal(0)
    setVideos(undefined)
    setError(undefined)

    setIsLoadingPlaylist(true)

    try {
      let id: string
      let owner: EthAddress

      if (typeof identification === "string") {
        const feed = await beeClient.feed.parseFeedFromRootManifest(identification)
        id = parsePlaylistIdFromTopic(feed.topic)
        owner = `0x${feed.owner}`
      } else {
        id = identification.id
        owner = identification.owner
      }

      const reader = new SwarmPlaylist.Reader(id, owner, {
        beeClient,
      })

      const playlist = await reader.download()
      setPlaylist(playlist)
    } catch (error: any) {
      if (error.response.status === 404) return

      setError("Error loading channel. Response: " + getResponseErrorMessage(error))
    } finally {
      setIsLoadingPlaylist(false)
    }
  }, [beeClient, identification])

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

      const limit = opts.seedLimit || 9
      if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")
      const from = (page - 1) * limit
      const to = from + limit

      fetchingPage.current = page
      const newVideos = await fetchVideos(from, to)
      setVideos(applyOwnerToVideos(newVideos))
      fetchingPage.current = undefined
    },
    [applyOwnerToVideos, fetchVideos, opts]
  )

  const loadMore = useCallback(async () => {
    if (isFetching) return
    if (!hasMore) {
      setIsFetching(false)
      return
    }

    if (playlist?.videos == null) return

    const limit = opts.loadMoreLimit || 9
    const from = videos?.length ?? 0
    const to = from + (limit === -1 ? playlist.videos.length ?? 0 : limit)
    const newVideos = await fetchVideos(from, to)
    setHasMore(to < playlist.videos.length)
    setVideos(applyOwnerToVideos([...(videos ?? []), ...newVideos]))
  }, [applyOwnerToVideos, fetchVideos, hasMore, isFetching, opts, playlist, videos])

  return {
    playlist,
    videos,
    total,
    error,
    isFetching,
    isLoadingPlaylist,
    isEncrypted,
    hasMore,
    loadPlaylist,
    loadMore,
    fetchPage,
  }
}
