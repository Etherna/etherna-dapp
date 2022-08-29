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

import { useCallback, useEffect, useRef, useState } from "react"
import { AxiosError } from "axios"

import EthernaIndexClient from "@/classes/EthernaIndexClient"
import SwarmPlaylistIO from "@/classes/SwarmPlaylist"
import SwarmVideoIO from "@/classes/SwarmVideo"
import useSelector from "@/state/useSelector"
import { useErrorMessage } from "@/state/hooks/ui"
import { getResponseErrorMessage } from "@/utils/request"
import { wait } from "@/utils/promise"
import type { Profile } from "@/definitions/swarm-profile"
import type { Video } from "@/definitions/swarm-video"
import type { SwarmPlaylist } from "@/definitions/swarm-playlist"

export type VideosSource = {
  type: "channel"
} | {
  type: "index"
  indexUrl: string
}

export type UseUserVideosOptions = {
  source: VideosSource
  profile: Profile
  limit?: number
}

let playlistResover: (() => Promise<SwarmPlaylist>) | undefined

export default function useUserVideos(opts: UseUserVideosOptions) {
  const beeClient = useSelector(state => state.env.beeClient)
  const address = useSelector(state => state.user.address)

  const channelPlaylist = useRef<SwarmPlaylist>()
  const indexClient = useRef<EthernaIndexClient>()
  const [isFetching, setIsFetching] = useState(false)
  const [currentPage, setCurrentPage] = useState(-1)
  const [total, setTotal] = useState(0)
  const [videos, setVideos] = useState<Video[]>()

  const { showError } = useErrorMessage()

  useEffect(() => {
    setTotal(-1)
    setVideos([])

    if (opts.source.type === "channel") {
      if (channelPlaylist.current) return

      const reader = new SwarmPlaylistIO.Reader(undefined, undefined, {
        owner: address,
        beeClient,
        id: "__channel"
      })

      playlistResover = () => reader.download()
    } else if (opts.source.type === "index") {
      indexClient.current = new EthernaIndexClient({
        host: opts.source.indexUrl,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.source.type, address])

  const getPlaylist = useCallback(async () => {
    if (channelPlaylist.current) return channelPlaylist.current

    const playlist = await playlistResover!()
    channelPlaylist.current = playlist
    return playlist
  }, [])

  const fetchPlaylistVideos = useCallback(async (page: number, limit: number): Promise<Video[]> => {
    const playlist = await getPlaylist()

    setTotal(playlist.videos?.length ?? 0)

    const from = page * limit
    const to = from + limit
    const references = playlist.videos?.slice(from, to) ?? []
    return await Promise.all(references.map(async playlistVid => {
      const reader = new SwarmVideoIO.Reader(playlistVid.reference, playlist.owner, {
        beeClient,
        fetchProfile: false,
        profileData: opts.profile,
      })
      const video = await reader.download(true)
      return video
    }))
  }, [beeClient, opts.profile, getPlaylist])

  const fetchIndexVideos = useCallback(async (page: number, limit: number): Promise<Video[]> => {
    const resp = await indexClient.current!.users.fetchVideos(address!, page, limit)

    setTotal(resp.totalElements)

    return resp.elements.map(video => {
      return new SwarmVideoIO.Reader(video.lastValidManifest!.hash, video.ownerAddress, {
        beeClient,
        indexData: video,
      }).video
    })
  }, [address, beeClient])

  const fetchVideos = useCallback(async (page: number, limit: number): Promise<Video[]> => {
    import.meta.env.DEV && wait(1000)

    return opts.source.type === "channel"
      ? await fetchPlaylistVideos(page, limit)
      : await fetchIndexVideos(page, limit)
  }, [fetchIndexVideos, fetchPlaylistVideos, opts.source.type])

  const fetchPage = useCallback(async (page: number) => {
    const limit = opts.limit || 10
    if (page < 1) throw new Error("Page must be greater than 0")
    if (!limit || limit < 1) throw new Error("Limit must be set to be greater than 1")

    try {
      setIsFetching(true)
      const newVideos = await fetchVideos(page - 1, limit)
      setVideos(newVideos)
    } catch (error: any) {
      setVideos([])
      if (error.response?.status !== 404) {
        showError("Fetching error", getResponseErrorMessage(error))
      }
    } finally {
      setCurrentPage(page)
      setIsFetching(false)
    }
  }, [opts.limit, fetchVideos, showError])

  const deleteVideosFromPlaylist = useCallback(async (videos: Video[]) => {
    const playlist = await getPlaylist()
    const writer = new SwarmPlaylistIO.Writer(playlist, {
      beeClient,
    })
    writer.removeVideos(videos.map(video => video.reference))
    writer.upload()
  }, [beeClient, getPlaylist])

  const deleteVideosFromIndex = useCallback(async (videos: Video[]) => {
    for (const video of videos) {
      try {
        await indexClient.current!.videos.deleteVideo(video.indexReference!)
      } catch (error) {
        const axiosError = error as AxiosError
        // set title for the error message
        axiosError.name = video.title ?? ""
        throw axiosError
      }
    }
  }, [indexClient])

  const deleteVideosFromSource = useCallback(async (videos: Video[]) => {
    try {
      if (opts.source.type === "channel") {
        await deleteVideosFromPlaylist(videos)
      } else if (opts.source.type === "index") {
        await deleteVideosFromIndex(videos)
      }
      await fetchPage(currentPage)
    } catch (error: any) {
      showError(`Cannot delete the video: ${error.name}`, getResponseErrorMessage(error))
    }
  }, [currentPage, opts.source.type, deleteVideosFromIndex, deleteVideosFromPlaylist, fetchPage, showError])

  return {
    isFetching,
    total,
    videos,
    fetchPage,
    deleteVideosFromSource,
  }
}
