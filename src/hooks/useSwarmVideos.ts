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
import useSelector from "@state/useSelector"
import { wait } from "@utils/promise"
import type { Profile } from "@definitions/swarm-profile"
import type { Video } from "@definitions/swarm-video"
import type { IndexVideo } from "@definitions/api-index"
import { showError } from "@state/actions/modals"

type SwarmVideosOptions = {
  seedLimit?: number
  fetchLimit?: number
  profileData?: Profile
  waitProfile?: boolean
}

const DEFAULT_SEED_LIMIT = 50
const DEFAULT_FETCH_LIMIT = 20

export default function useSwarmVideos(opts: SwarmVideosOptions = {}) {
  const { beeClient, indexClient } = useSelector(state => state.env)
  const [videos, setVideos] = useState<Video[]>()
  const [page, setPage] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (opts.waitProfile && !opts.profileData) {
      // waiting profile is fetching
      setIsFetching(true)
      return
    }
    fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, opts.waitProfile, opts.profileData])

  useEffect(() => {
    if (opts.profileData) {
      updateVideosProfile(opts.profileData)
    }
  }, [opts.profileData])

  const updateVideosProfile = (profile: Profile) => {
    setVideos(videos => videos?.map(video => ({
      ...video,
      owner: profile
    })))
  }

  const videoLoadPromise = (indexData: IndexVideo) => {
    const { profileData } = opts
    const fetchProfile = !profileData
    const swarmVideoReader = new SwarmVideoIO.Reader(indexData.id, indexData.ownerAddress, {
      beeClient,
      indexClient,
      indexData,
      profileData,
      fetchProfile,
    })
    return swarmVideoReader.download()
  }

  const fetchVideos = async () => {
    if (!hasMore) {
      return setIsFetching(false)
    }

    setIsFetching(true)

    const take = page === 0 ? opts.seedLimit ?? DEFAULT_SEED_LIMIT : opts.fetchLimit ?? DEFAULT_FETCH_LIMIT

    try {
      const indexVideos = await indexClient.videos.fetchLatestVideos(page, take)
      const newVideos = await Promise.all(indexVideos.map(videoLoadPromise))
      import.meta.env.DEV && await wait(1500)

      if (newVideos.length < take) {
        setHasMore(false)
      }

      setVideos(videos => {
        return [
          ...(videos ?? []),
          ...newVideos
        ].filter((vid, i, self) => self.indexOf(vid) === i)
      })
    } catch (error) {
      showError("Fetch error", "Coudn't fetch the videos. Try again later.")
    }

    setIsFetching(false)
  }

  // Returns
  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(page => page + 1)
    }
  }

  const refresh = () => {
    setVideos([])
    setHasMore(true)
    setPage(0)
    fetchVideos()
  }

  return {
    videos,
    hasMore,
    isFetching,
    loadMore,
    refresh,
  }
}
