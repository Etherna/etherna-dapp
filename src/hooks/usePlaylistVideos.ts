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

import { useEffect, useState } from "react"

import SwarmVideoIO from "@/classes/SwarmVideo"
import { showError } from "@/state/actions/modals"
import useSelector from "@/state/useSelector"
import type { SwarmPlaylist } from "@/definitions/swarm-playlist"
import type { Video } from "@/definitions/swarm-video"
import type { Profile } from "@/definitions/swarm-profile"

type PlaylistVideosOptions = {
  owner?: Profile | null
  waitProfile?: boolean
  limit?: number
  autofetch?: boolean
}

export default function usePlaylistVideos(
  playlist: SwarmPlaylist | undefined,
  opts: PlaylistVideosOptions = { limit: -1, autofetch: true }
) {
  const { beeClient, indexClient } = useSelector(state => state.env)
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

  useEffect(() => {
    if (opts.waitProfile) {
      if (!opts.owner) {
        setIsFetching(true)
        return
      } else {
        setIsFetching(false)
      }
    }

    if (playlist && opts.autofetch && hasMore) {
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts, playlist, hasMore])

  const fetchVideos = async (from: number, to: number): Promise<Video[]> => {
    if (
      !playlist?.videos ||
      (opts.waitProfile && !opts.owner)
    ) {
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
      console.error(error)

      showError("Fetching error", "Coudn't fetch playlist videos")
      setIsFetching(false)
      return []
    }
  }

  const fetchPage = async (page: number) => {
    const limit = opts.limit
    if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")
    const from = ((page - 1) * limit)
    const to = from + limit
    const newVideos = await fetchVideos(from, to)
    setVideos(newVideos)
  }

  const loadMore = async () => {
    if (isFetching) return
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
  }

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
