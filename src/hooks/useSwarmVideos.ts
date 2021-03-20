import { useEffect, useState } from "react"

import SwarmVideo from "@classes/SwarmVideo"
import { Profile } from "@classes/SwarmProfile/types"
import { Video } from "@classes/SwarmVideo/types"
import useSelector from "@state/useSelector"
import { IndexVideo } from "@classes/EthernaIndexClient/types"

type SwarmVideosOptions = {
  seedLimit?: number
  fetchLimit?: number
  profileData?: Profile
  ownerAddress?: string
}

type UseVideos = {
  /** Videos list */
  videos: Video[] | undefined
  /** Whether more videos can be fetched */
  hasMore: boolean
  /** Is fetching videos */
  isFetching: boolean
  /** Load more videos */
  loadMore: () => void
}

const DEFAULT_SEED_LIMIT = 50
const DEFAULT_FETCH_LIMIT = 20

const useSwarmVideos = (opts: SwarmVideosOptions = {}): UseVideos => {
  const { beeClient, indexClient } = useSelector(state => state.env)
  const [videos, setVideos] = useState<Video[]>()
  const [page, setPage] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setPage(0)
    setVideos([])
    setHasMore(true)
  }, [opts.ownerAddress])

  useEffect(() => {
    fetchVideos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (opts.profileData) {
      updateVideosProfile(opts.profileData)
    }
  }, [opts.profileData])

  const updateVideosProfile = (profile: Profile) => {
    setVideos(videos => videos?.map(video => ({
      ...video,
      owner: {
        ownerAddress: profile.address,
        ownerIdentityManifest: profile.manifest,
        profileData: profile
      }
    })))
  }

  const videoLoadPromise = (indexData: IndexVideo) => {
    const { ownerAddress, profileData } = opts
    const fetchProfile = !ownerAddress && !profileData
    const swarmVideo = new SwarmVideo(indexData.manifestHash, {
      beeClient,
      indexClient,
      indexData,
      profileData,
      fetchProfile
    })
    return swarmVideo.downloadVideo()
  }

  const fetchVideos = async () => {
    setIsFetching(true)

    const { ownerAddress } = opts
    const take = page === 0 ? opts.seedLimit ?? DEFAULT_SEED_LIMIT : opts.fetchLimit ?? DEFAULT_FETCH_LIMIT
    const indexVideos = ownerAddress
      ? await indexClient.users.fetchUserVideos(ownerAddress, page, take)
      : await indexClient.videos.fetchVideos(page, take)

    const newVideos = await Promise.all(indexVideos.map(videoLoadPromise))

    if (newVideos.length < take) {
      setHasMore(false)
    }

    setVideos((videos ?? []).concat(newVideos))

    setIsFetching(false)
  }

  // Returns
  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(page => page + 1)
    }
  }

  return {
    videos,
    hasMore,
    isFetching,
    loadMore
  }
}

export default useSwarmVideos
