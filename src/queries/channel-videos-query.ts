import { useEffect, useRef } from "react"
import { VideoDeserializer } from "@etherna/sdk-js/serializers"
import { fetchAddressFromEns, isEnsAddress, isEthAddress } from "@etherna/sdk-js/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { z } from "zod"

import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import { FundsMissingError } from "@/errors/funds-missing-error"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"

import type { VideoWithOwner } from "@/types/video"
import type { Playlist, Profile, ProfileWithEns } from "@etherna/sdk-js"
import type { EnsAddress, EthAddress, Reference } from "@etherna/sdk-js/clients"

interface ChannelVideosQueryOptions {
  address: EthAddress | EnsAddress
  profile: Profile | null
  source: string
  firstFetchCount?: number
  sequentialFetchCount?: number
}

export const useChannelVideosQuery = (opts: ChannelVideosQueryOptions) => {
  const beeClient = useClientsStore(state => state.beeClient)
  const isSignedInGateway = useUserStore(state => state.isSignedInGateway)
  const credit = useUserStore(state => state.credit)
  const creditUnlimited = useUserStore(state => state.creditUnlimited)
  const total = useRef(NaN)
  const channelPlaylist = useRef<Playlist>()
  const ownerAddress = useRef<EthAddress | undefined>(
    isEthAddress(opts.address) ? opts.address : undefined
  )

  const firstFetchCount = opts.firstFetchCount ?? 48
  const sequentialFetchCount = opts.sequentialFetchCount ?? 12
  const firstFetchPagesCount = Math.ceil(firstFetchCount / sequentialFetchCount)
  const isIndexSource = z.string().url().safeParse(opts.source).success

  const maxCursor = isNaN(total.current) ? 0 : Math.ceil(total.current / sequentialFetchCount)

  useEffect(() => {
    ownerAddress.current = isEthAddress(opts.address) ? opts.address : undefined
    channelPlaylist.current = undefined
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
      const profile: ProfileWithEns = {
        ...opts.profile!,
        ens: isEnsAddress(opts.address) ? opts.address : null,
      }

      const ownerAddress = await getOwnerAddress()

      if (isIndexSource) {
        const client = new IndexClient(opts.source)
        const resp = await client.users.fetchVideos(ownerAddress, page, limit)

        total.current = resp.totalElements

        return resp.elements
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
      } else if (opts.source === "channel") {
        if (!channelPlaylist.current) {
          const ownerAddress =
            opts.profile?.address ??
            (isEnsAddress(opts.address) ? await fetchAddressFromEns(opts.address) : opts.address)

          if (!ownerAddress) {
            throw new Error("ENS address not found")
          }

          const reader = new SwarmPlaylist.Reader(undefined, {
            beeClient,
            playlistId: SwarmPlaylist.Reader.channelPlaylistId,
            playlistOwner: ownerAddress,
          })

          try {
            channelPlaylist.current = await reader.download()
          } catch (error) {
            console.error(error)

            if (!isSignedInGateway || (!credit && !creditUnlimited)) {
              throw new FundsMissingError()
            }
          }
        }

        if (!channelPlaylist.current) {
          total.current = 0
          return []
        }

        const from = input.pageParam
          ? firstFetchPagesCount + (input.pageParam - 1) * sequentialFetchCount
          : 0
        const to = from + limit
        const vids = channelPlaylist.current.videos?.slice(from, to) ?? []
        const videos = await Promise.all(
          vids.map(async playlistVid => {
            const reader = new SwarmVideo.Reader(playlistVid.reference, {
              beeClient,
            })
            const video = await reader.download({ mode: "preview" })
            return video
          })
        )
        const videosIndexes = videos.map<VideoWithOwner>((video, i) => ({
          reference: video?.reference ?? (vids[i]!.reference as Reference),
          preview: video?.preview ?? {
            reference: "",
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

        return videosIndexes
      } else {
        throw new Error("Invalid source")
      }
    },
    initialPageParam: 0,
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
      if (lastPageParam === maxCursor) {
        return undefined
      }
      return lastPageParam + 1
    },
    enabled: !!opts.profile,
  })
}
