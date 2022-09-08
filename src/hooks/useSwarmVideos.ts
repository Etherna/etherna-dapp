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

import SwarmProfileIO from "@/classes/SwarmProfile"
import SwarmVideoIO from "@/classes/SwarmVideo"
import type { IndexVideo } from "@/definitions/api-index"
import type { Video } from "@/definitions/swarm-video"
import { showError } from "@/state/actions/modals"
import useSelector from "@/state/useSelector"
import { wait } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

type SwarmVideosOptions = {
  seedLimit?: number
  fetchLimit?: number
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
    fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const loadVideoProfiles = useCallback(
    async (videos: Video[]) => {
      const addresses = videos
        .filter(video => !video.owner)
        .map(video => video.ownerAddress)
        .filter((address, index, self) => address && self.indexOf(address) === index) as string[]

      const profiles = await Promise.all(
        addresses.map(async address => {
          const profileReader = new SwarmProfileIO.Reader(address, {
            beeClient,
            fetchFromCache: true,
          })
          const profile = await profileReader.download()
          return profile
        })
      )
      import.meta.env.DEV && (await wait(1000))

      setVideos(videos => {
        const updatedVideos = [...(videos ?? [])]
        for (const video of updatedVideos) {
          if (!video.owner) {
            const profile =
              profiles.find(profile => profile?.address === video.ownerAddress) ??
              SwarmProfileIO.getDefaultProfile(video.ownerAddress ?? "0x0")
            video.owner = profile
          }
        }
        return updatedVideos
      })
    },
    [beeClient]
  )

  const videoLoadPromise = useCallback(
    (indexData: IndexVideo) => {
      const swarmVideoReader = new SwarmVideoIO.Reader(indexData.id, indexData.ownerAddress, {
        beeClient,
        indexClient,
        indexData,
        fetchProfile: false,
      })
      return swarmVideoReader.download()
    },
    [beeClient, indexClient]
  )

  const fetchVideos = useCallback(async () => {
    if (!hasMore) {
      return setIsFetching(false)
    }

    setIsFetching(true)

    const take =
      page === 0 ? opts.seedLimit ?? DEFAULT_SEED_LIMIT : opts.fetchLimit ?? DEFAULT_FETCH_LIMIT

    try {
      const indexVideos = await indexClient.videos.fetchLatestVideos(page, take)
      const newVideos = await Promise.all(indexVideos.map(videoLoadPromise))
      import.meta.env.DEV && (await wait(1000))

      if (newVideos.length < take) {
        setHasMore(false)
      }

      setVideos(videos => {
        return [...(videos ?? []), ...newVideos].filter((vid, i, self) => self.indexOf(vid) === i)
      })

      loadVideoProfiles(newVideos)
    } catch (error: any) {
      showError("Coudn't fetch the videos", getResponseErrorMessage(error))
    }

    setIsFetching(false)
  }, [
    hasMore,
    page,
    indexClient,
    opts.seedLimit,
    opts.fetchLimit,
    videoLoadPromise,
    loadVideoProfiles,
  ])

  // Returns
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(page => page + 1)
    }
  }, [isFetching, hasMore])

  const refresh = useCallback(() => {
    setVideos([])
    setHasMore(true)
    setPage(0)
    fetchVideos()
  }, [fetchVideos])

  return {
    videos,
    hasMore,
    isFetching,
    loadMore,
    refresh,
  }
}
