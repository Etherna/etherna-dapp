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

import SwarmVideoIO from "@/classes/SwarmVideo"
import { showError } from "@/state/actions/modals"
import useSelector from "@/state/useSelector"
import type { SwarmPlaylist } from "@/definitions/swarm-playlist"
import type { Video } from "@/definitions/swarm-video"
import type { Profile } from "@/definitions/swarm-profile"

type PlaylistVideosOptions = {
  owner?: Profile | null
  limit?: number
}

export default function usePlaylistVideos(
  playlist: SwarmPlaylist | undefined,
  opts: PlaylistVideosOptions = { limit: -1 }
) {
  const beeClient = useSelector(state => state.env.beeClient)
  const indexClient = useSelector(state => state.env.indexClient)
  const [videos, setVideos] = useState<Video[]>()
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [isEncrypted, setIsEncrypted] = useState(playlist?.type === "private" && !playlist.videos)

  useEffect(() => {
    if (playlist) {
      setVideos(undefined)
      setHasMore((playlist.videos ?? []).length > 0)
      setIsEncrypted(playlist.type === "private" && !playlist.videos)
    }
  }, [playlist])

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

      setIsFetching(false)

      return newVideos
    } catch (error) {
      showError("Fetching error", "Coudn't fetch playlist video")
      setIsFetching(false)
      return []
    }
  }, [beeClient, indexClient, opts.owner, playlist])

  const fetchPage = useCallback(async (page: number) => {
    const limit = opts.limit
    if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")
    const from = ((page - 1) * limit)
    const to = from + limit
    const newVideos = await fetchVideos(from, to)
    setVideos(newVideos)
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
    videos,
    total,
    isFetching,
    isEncrypted,
    hasMore,
    loadMore,
    fetchPage,
  }
}
