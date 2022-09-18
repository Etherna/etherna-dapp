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
import type { EthAddress } from "@etherna/api-js/clients"
import { VideoDeserializer } from "@etherna/api-js/serializers"

import SwarmProfile from "@/classes/SwarmProfile"
import SwarmVideo from "@/classes@/types/api-index
import type { VideoWithOwner } from "@/types/video"
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
  const [videos, setVideos] = useState<VideoWithOwner[]>()
  const [page, setPage] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const loadVideoProfiles = useCallback(
    async (videos: VideoWithOwner[]) => {
      const addresses = videos
        .filter(video => !video.owner)
        .map(video => video.ownerAddress)
        .filter((address, index, self) => address && self.indexOf(address) === index) as string[]

      const profiles = await Promise.all(
        addresses.map(async address => {
          const profileReader = new SwarmProfile.Reader(address as EthAddress, {
            beeClient,
          })
          const profile = await profileReader.download()
          return profile ?? profileReader.emptyProfile()
        })
      )
      import.meta.env.DEV && (await wait(1000))

      setVideos(videos => {
        const updatedVideos = [...(videos ?? [])]
        for (const video of updatedVideos) {
          if (!video.owner) {
            const profile =
              profiles.find(profile => profile?.address === video.ownerAddress) ??
              new SwarmProfile.Reader(video.ownerAddress as EthAddress, {
                beeClient,
              }).emptyProfile()
            video.owner = profile
          }
        }
        return updatedVideos
      })
    },
    [beeClient]
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
      const newVideos = indexVideos.map(indexVideo => {
        const swarmVideoReader = new SwarmVideo.Reader(indexVideo.id, {
          beeClient,
          indexClient,
        })
        const videoRaw = JSON.stringify(swarmVideoReader.indexVideoToRaw(indexVideo))
        const video = new VideoDeserializer(beeClient.url).deserialize(videoRaw, {
          reference: indexVideo.lastValidManifest?.hash ?? "",
        })
        const videoOwner: VideoWithOwner = {
          ...video,
          owner: undefined,
        }
        return videoOwner
      })
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
  }, [hasMore, page, opts.seedLimit, opts.fetchLimit, indexClient, loadVideoProfiles, beeClient])

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
