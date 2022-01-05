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

import SwarmVideoIO from "@classes/SwarmVideo"
import { showError } from "@state/actions/modals"
import useSelector from "@state/useSelector"
import type { SwarmPlaylist } from "@definitions/swarm-playlist"
import type { Video } from "@definitions/swarm-video"
import type { Profile } from "@definitions/swarm-profile"

type PlaylistVideosOptions = {
  owner?: Profile
  waitProfile?: boolean
  limit?: number
}

export default function usePlaylistVideos(
  playlist: SwarmPlaylist | undefined,
  opts: PlaylistVideosOptions = { limit: -1 }
) {
  const { beeClient, indexClient } = useSelector(state => state.env)
  const [videos, setVideos] = useState<Video[]>()
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(false)
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
      setIsFetching(true)
    }
    if (opts.waitProfile && opts.owner) {
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.owner])

  const loadMore = async () => {
    if (!hasMore) return setIsFetching(false)
    if (!playlist?.videos) return setIsFetching(false)
    if (opts.waitProfile && !opts.owner) return setIsFetching(false)

    setIsFetching(true)
    try {
      const limit = opts.limit!
      const from = videos?.length ?? 0
      const to = from + (limit === -1 ? playlist.videos.length : limit)
      const references = playlist.videos.slice(from, to)
      const newVideos = await Promise.all(references.map(ref => {
        const reader = new SwarmVideoIO.Reader(ref, playlist.owner, {
          beeClient,
          indexClient,
          fetchProfile: !opts.owner,
          profileData: opts.owner,
        })
        return reader.download()
      }))
      setVideos([
        ...(videos ?? []),
        ...newVideos,
      ])
    } catch (error) {
      showError("Fetching error", "Coudn't fetch playlist video")
    }
    setIsFetching(false)
  }

  return {
    videos,
    isFetching,
    isEncrypted,
    hasMore,
    loadMore,
  }
}
