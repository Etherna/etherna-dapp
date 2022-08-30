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

import SwarmBeeClient from "@/classes/SwarmBeeClient"
import SwarmPlaylistIO from "@/classes/SwarmPlaylist"
import SwarmVideoIO from "@/classes/SwarmVideo"
import useSelector from "@/state/useSelector"
import { useErrorMessage } from "@/state/hooks/ui"
import { getResponseErrorMessage } from "@/utils/request"
import type { SwarmPlaylist } from "@/definitions/swarm-playlist"
import type { Video } from "@/definitions/swarm-video"
import type { Profile } from "@/definitions/swarm-profile"

type PlaylistVideosOptions = {
  owner?: Profile | null
  limit?: number
}

export default function usePlaylistVideos(
  playlistReference: SwarmPlaylist | string | undefined,
  opts: PlaylistVideosOptions = { limit: -1 }
) {
  const beeClient = useSelector(state => state.env.beeClient)
  const indexClient = useSelector(state => state.env.indexClient)
  const [playlist, setPlaylist] = useState<SwarmPlaylist | undefined>(
    typeof playlistReference === "string" ? undefined : playlistReference
  )
  const [videos, setVideos] = useState<Video[]>()
  const [isFetching, setIsFetching] = useState(false)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [isEncrypted, setIsEncrypted] = useState(playlist?.type === "private" && !playlist.videos)
  const fetchingPage = useRef<number>()

  const { showError } = useErrorMessage()

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

  const loadPlaylist = useCallback(async () => {
    if (typeof playlistReference !== "string") return
    if (!opts.owner) return

    setTotal(0)
    setVideos(undefined)

    setIsLoadingPlaylist(true)

    const isReference = SwarmBeeClient.isValidHash(playlistReference)
    const reference = isReference ? playlistReference : undefined
    const id = isReference ? undefined : playlistReference

    try {
      const reader = new SwarmPlaylistIO.Reader(
        reference,
        undefined,
        {
          beeClient,
          id,
          owner: opts.owner?.address,
        }
      )

      const playlist = await reader.download()
      setPlaylist(playlist)
    } catch (error: any) {
      if (error.response.status === 404) return

      showError("Error loading channel", getResponseErrorMessage(error))
    } finally {
      setIsLoadingPlaylist(false)
    }

  }, [beeClient, opts.owner, playlistReference, showError])

  const fetchVideos = useCallback(async (from: number, to: number): Promise<Video[]> => {
    if (!playlist?.videos) {
      setIsFetching(false)
      return []
    }

    setTotal(playlist.videos.length)
    setIsFetching(true)

    try {
      const references = playlist.videos.slice(from, to)
      const newVideos = await Promise.all(references.map(video => {
        const reader = new SwarmVideoIO.Reader(video.reference, playlist.owner, {
          beeClient,
          indexClient,
          fetchProfile: !opts.owner,
          profileData: opts.owner ?? undefined,
        })
        return reader.download()
      }))

      return newVideos
    } catch (error) {
      showError("Fetching error", "Coudn't fetch playlist video")
      return []
    } finally {
      setIsFetching(false)
    }
  }, [beeClient, indexClient, opts.owner, playlist, showError])

  const fetchPage = useCallback(async (page: number) => {
    if (fetchingPage.current === page) return

    const limit = opts.limit
    if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")
    const from = ((page - 1) * limit)
    const to = from + limit

    fetchingPage.current = page
    const newVideos = await fetchVideos(from, to)
    setVideos(newVideos)
    fetchingPage.current = undefined
  }, [fetchVideos, opts.limit])

  const loadMore = useCallback(async () => {
    if (!hasMore) {
      setIsFetching(false)
      return
    }

    if (playlist?.videos == null) return

    const limit = opts.limit!
    const from = videos?.length ?? 0
    const to = from + (limit === -1 ? playlist.videos.length ?? 0 : limit)
    const newVideos = await fetchVideos(from, to)
    setHasMore(to < playlist.videos.length)
    setVideos([
      ...(videos ?? []),
      ...newVideos,
    ])
  }, [fetchVideos, hasMore, opts.limit, playlist, videos])

  return {
    playlist,
    videos,
    total,
    isFetching,
    isLoadingPlaylist,
    isEncrypted,
    hasMore,
    loadPlaylist,
    loadMore,
    fetchPage,
  }
}
