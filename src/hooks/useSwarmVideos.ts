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
import { startTransition, useCallback, useEffect, useState } from "react"
import { EthernaResourcesHandler } from "@etherna/api-js/handlers"
import { VideoDeserializer } from "@etherna/api-js/serializers"

import useErrorMessage from "./useErrorMessage"
import useSmartFetchCount from "./useSmartFetchCount"
import { parseReaderStatus } from "./useVideoOffers"
import SwarmProfile from "@/classes/SwarmProfile"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import { wait } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

import type { VideoWithIndexes, VideoWithOffersStatus, VideoWithOwner } from "@/types/video"
import type { EthAddress } from "@etherna/api-js/clients"

type SwarmVideosOptions = {
  gridRef?: React.RefObject<HTMLElement>
  query?: string
  seedLimit?: number
  fetchLimit?: number
}

type VideoWithAll = VideoWithOwner & VideoWithIndexes & VideoWithOffersStatus

export default function useSwarmVideos(opts: SwarmVideosOptions = {}) {
  const indexClient = useClientsStore(state => state.indexClient)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const indexUrl = useExtensionsStore(state => state.currentIndexUrl)
  const [videos, setVideos] = useState<VideoWithAll[]>()
  const [page, setPage] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const fetchCount = useSmartFetchCount(opts.gridRef, opts.seedLimit, opts.fetchLimit)
  const { showError } = useErrorMessage()

  useEffect(() => {
    setVideos(undefined)
    setHasMore(true)

    if (page > 0) {
      setPage(0)
    } else {
      if (fetchCount) {
        fetchVideos(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.query])

  useEffect(() => {
    if (!fetchCount) return
    if (page < 0) return
    fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchCount])

  const loadVideosOffers = useCallback(
    async (videos: VideoWithAll[]) => {
      if (!videos.length) return

      try {
        const handler = new EthernaResourcesHandler(videos, { gatewayClient })
        await handler.fetchOffers({ withByWhom: false })

        const fetchedVideosReferences = videos.map(video => video.reference)
        setVideos(videos =>
          videos?.map(video => {
            const offers = fetchedVideosReferences.includes(video.reference)
              ? parseReaderStatus(handler, video, undefined)
              : video.offers
            return {
              ...video,
              offers,
            }
          })
        )
      } catch (error) {
        console.error(error)
      }
    },
    [gatewayClient]
  )

  const loadVideoProfiles = useCallback(
    async (videos: VideoWithAll[]) => {
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

  const fetchVideos = useCallback(
    async (refetch = false) => {
      if (!refetch && isFetching) return
      if (!fetchCount) return
      if (!refetch && !hasMore) {
        return setIsFetching(false)
      }

      setIsFetching(true)

      try {
        const indexVideos = opts?.query
          ? await indexClient.search.fetchVideos(opts.query, page, fetchCount)
          : await indexClient.videos.fetchLatestVideos(page, fetchCount)

        const newVideos = indexVideos.map(indexVideo => {
          const swarmVideoReader = new SwarmVideo.Reader(indexVideo.id, {
            beeClient,
            indexClient,
          })
          const videoRaw = JSON.stringify(swarmVideoReader.indexVideoToRaw(indexVideo))
          const video = new VideoDeserializer(beeClient.url).deserialize(videoRaw, {
            reference: indexVideo.lastValidManifest?.hash ?? "",
          })
          const videoOwner: VideoWithAll = {
            ...video,
            owner: undefined,
            indexesStatus: {
              [indexUrl]: {
                indexReference: indexVideo.id,
                totDownvotes: indexVideo.totDownvotes,
                totUpvotes: indexVideo.totUpvotes,
              },
            },
            offers: undefined,
          }
          return videoOwner
        })

        import.meta.env.DEV && (await wait(1000))

        if (newVideos.length < fetchCount) {
          setHasMore(false)
        }

        setVideos(videos => {
          return [...(videos ?? []), ...newVideos].filter((vid, i, self) => self.indexOf(vid) === i)
        })

        loadVideoProfiles(newVideos)
        loadVideosOffers(newVideos)
      } catch (error: any) {
        showError("Coudn't fetch the videos", getResponseErrorMessage(error))
      }

      setIsFetching(false)
    },
    [
      opts.query,
      isFetching,
      hasMore,
      page,
      indexClient,
      beeClient,
      indexUrl,
      fetchCount,
      loadVideoProfiles,
      loadVideosOffers,
      showError,
    ]
  )

  // Returns
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(page => page + 1)
    }
  }, [isFetching, hasMore])

  const refresh = useCallback(() => {
    setVideos([])
    setHasMore(true)
    // trigger effect when page is already 0
    setPage(-1)
    startTransition(() => {
      setPage(0)
    })
  }, [])

  return {
    videos,
    hasMore,
    isFetching,
    fetchCount,
    loadMore,
    refresh,
  }
}
