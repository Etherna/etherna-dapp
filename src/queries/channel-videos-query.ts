import { useEffect, useRef } from "react"
import { VideoDeserializer } from "@etherna/sdk-js/serializers"
import { fetchAddressFromEns, isEnsAddress, isEthAddress } from "@etherna/sdk-js/utils"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

import { useVideoPreviewQuery } from "./video-preview-query"
import IndexClient from "@/classes/IndexClient"
import SwarmVideo from "@/classes/SwarmVideo"
import useClientsStore from "@/stores/clients"

import type { VideoWithOwner } from "@/types/video"
import type { Playlist, Profile, ProfileWithEns } from "@etherna/sdk-js"
import type { EnsAddress, EthAddress, Reference } from "@etherna/sdk-js/clients"

export type ChannelSource = { type: "playlist"; data: Playlist } | { type: "index"; url: string }

interface ChannelVideosQueryOptions {
  address: EthAddress | EnsAddress
  profile: Profile | null
  source: ChannelSource | undefined
  firstFetchCount?: number
  sequentialFetchCount?: number
}

export const useChannelVideosQuery = (opts: ChannelVideosQueryOptions) => {
  const beeClient = useClientsStore(state => state.beeClient)
  const total = useRef(NaN)
  const ownerAddress = useRef<EthAddress | undefined>(
    isEthAddress(opts.address) ? opts.address : undefined
  )
  const queryClient = useQueryClient()

  const firstFetchCount = opts.firstFetchCount ?? 48
  const sequentialFetchCount = opts.sequentialFetchCount ?? 12
  const firstFetchPagesCount = Math.ceil(firstFetchCount / sequentialFetchCount)

  const maxCursor = isNaN(total.current) ? 0 : Math.ceil(total.current / sequentialFetchCount)

  useEffect(() => {
    ownerAddress.current = isEthAddress(opts.address) ? opts.address : undefined
    total.current = NaN
  }, [opts.address, opts.source])

  const getOwnerAddress = async () => {
    if (ownerAddress.current) {
      return ownerAddress.current
    }

    if (isEnsAddress(opts.address)) {
      const address = await fetchAddressFromEns(opts.address)

      if (address) {
        ownerAddress.current = address
        return address
      }
    }

    throw new Error("ENS address not found")
  }

  return useInfiniteQuery({
    queryKey: ["channel-videos", opts.address, opts.source],
    meta: {
      total: NaN,
    },
    queryFn: async input => {
      const page = input.pageParam
        ? Math.ceil(firstFetchPagesCount / sequentialFetchCount) + input.pageParam
        : 0
      const limit = input.pageParam ? sequentialFetchCount : firstFetchCount
      const profile = opts.profile
        ? ({
            ...opts.profile!,
            ens: isEnsAddress(opts.address) ? opts.address : null,
          } satisfies ProfileWithEns)
        : undefined

      const ownerAddress = await getOwnerAddress()
      const source = opts.source

      let videos: VideoWithOwner[] = []

      if (source?.type === "index") {
        const client = new IndexClient(source.url)
        const resp = await client.users.fetchVideos(ownerAddress, page, limit)

        total.current = resp.totalElements

        videos = resp.elements
          .filter(vid => vid.lastValidManifest)
          .map(indexVideo => {
            try {
              const videoReader = new SwarmVideo.Reader(indexVideo.lastValidManifest!.hash, {
                beeClient,
              })
              const rawVideo = videoReader.indexVideoToRaw(indexVideo)
              const deserializer = new VideoDeserializer(beeClient.url)
              const preview = deserializer.deserializePreview(JSON.stringify(rawVideo.preview), {
                reference: indexVideo.lastValidManifest!.hash,
              })
              const details = deserializer.deserializeDetails(JSON.stringify(rawVideo.details), {
                reference: indexVideo.lastValidManifest!.hash,
              })
              const videoIndexes: VideoWithOwner = {
                reference: indexVideo.lastValidManifest!.hash as Reference,
                preview,
                details,
                owner: profile,
              }
              return videoIndexes
            } catch (error) {
              return null
            }
          })
          .filter(Boolean) as VideoWithOwner[]
      } else if (source?.type === "playlist") {
        total.current = source.data.details.videos.length

        const from = input.pageParam
          ? firstFetchPagesCount + (input.pageParam - 1) * sequentialFetchCount
          : 0
        const to = from + limit
        const vids = source.data.details.videos.slice(from, to) ?? []
        const playlistVideos = await Promise.all(
          vids.map(async playlistVid => {
            return await queryClient.fetchQuery(
              useVideoPreviewQuery.getQueryConfig({ reference: playlistVid.reference })
            )
          })
        )
        videos = playlistVideos.map<VideoWithOwner>((video, i) => ({
          reference: video?.reference ?? (vids[i]!.reference as Reference),
          preview: video?.preview ?? {
            reference: "" as Reference,
            title: vids[i]!.title,
            createdAt: vids[i]!.addedAt,
            duration: 0,
            ownerAddress,
            thumbnail: null,
            updatedAt: null,
            v: "1.0",
          },
          details: video?.details,
          indexesStatus: {},
          owner: profile,
        }))
      } else {
        throw new Error("Invalid source")
      }

      return { videos, total: total.current }
    },
    initialPageParam: 0,
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
      if (lastPageParam === maxCursor) {
        return undefined
      }
      return lastPageParam + 1
    },
    enabled: !!opts.source && opts.firstFetchCount !== 0,
  })
}
