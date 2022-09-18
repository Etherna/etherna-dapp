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
import type { Playlist, Profile, Video } from "@etherna/api-js"
import { VideoDeserializer } from "@etherna/api-js/serializers"
import type { AxiosError } from "axios"

import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import type { VideoWithIndexes } from "@/definitions/video"
import { useErrorMessage } from "@/state/hooks/ui"
import useSelector from "@/state/useSelector"
import { wait } from "@/utils/promise"
import { getResponseErrorMessage } from "@/utils/request"

export type VideosSource =
  | {
      type: "channel"
    }
  | {
      type: "index"
      indexUrl: string
    }

export type UseUserVideosOptions = {
  source: VideosSource
  profile: Profile
  limit?: number
}

let playlistResover: (() => Promise<Playlist>) | undefined

export default function useUserVideos(opts: UseUserVideosOptions) {
  const beeClient = useSelector(state => state.env.beeClient)
  const address = useSelector(state => state.user.address)

  const channelPlaylist = useRef<Playlist>()
  const indexClient = useRef<IndexClient>()
  const [isFetching, setIsFetching] = useState(false)
  const [currentPage, setCurrentPage] = useState(-1)
  const [total, setTotal] = useState(0)
  const [videos, setVideos] = useState<VideoWithIndexes[]>()

  const { showError } = useErrorMessage()

  useEffect(() => {
    setTotal(-1)
    setVideos([])

    if (opts.source.type === "channel") {
      if (channelPlaylist.current) return

      const reader = new SwarmPlaylist.Reader(undefined, {
        playlistId: SwarmPlaylist.Reader.channelPlaylistId,
        playlistOwner: address,
        beeClient,
      })

      playlistResover = () => reader.download()
    } else if (opts.source.type === "index") {
      indexClient.current = new IndexClient({
        url: opts.source.indexUrl,
        apiPath: `/api/v${import.meta.env.VITE_APP_API_VERSION}`,
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

  const fetchPlaylistVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      const playlist = await getPlaylist()

      setTotal(playlist.videos?.length ?? 0)

      const from = page * limit
      const to = from + limit
      const references = playlist.videos?.slice(from, to) ?? []
      const videos = await Promise.all(
        references.map(async playlistVid => {
          const reader = new SwarmVideo.Reader(playlistVid.reference, {
            beeClient,
          })
          const video = await reader.download()
          return video
        })
      )
      const videosIndexes = videos.filter(Boolean).map<VideoWithIndexes>(video => ({
        ...(video as Video),
        indexesStatus: {},
      }))

      return videosIndexes
    },
    [beeClient, getPlaylist]
  )

  const fetchIndexVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      const resp = await indexClient.current!.users.fetchVideos(address!, page, limit)

      setTotal(resp.totalElements)

      return resp.elements.map(indexVideo => {
        const videoReader = new SwarmVideo.Reader(indexVideo.lastValidManifest!.hash, {
          beeClient,
        })
        const rawVideo = JSON.stringify(videoReader.indexVideoToRaw(indexVideo))
        const video = new VideoDeserializer(beeClient.url).deserialize(rawVideo, {
          reference: indexVideo.lastValidManifest!.hash,
        })
        const videoIndexes: VideoWithIndexes = {
          ...video,
          indexesStatus: {
            [indexClient.current!.url]: {
              indexReference: indexVideo.id,
            },
          },
        }
        return videoIndexes
      })
    },
    [address, beeClient]
  )

  const fetchVideos = useCallback(
    async (page: number, limit: number): Promise<VideoWithIndexes[]> => {
      import.meta.env.DEV && wait(1000)

      return opts.source.type === "channel"
        ? await fetchPlaylistVideos(page, limit)
        : await fetchIndexVideos(page, limit)
    },
    [fetchIndexVideos, fetchPlaylistVideos, opts.source.type]
  )

  const fetchPage = useCallback(
    async (page: number) => {
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
    },
    [opts.limit, fetchVideos, showError]
  )

  const deleteVideosFromPlaylist = useCallback(
    async (videosToDelete: Video[]) => {
      const playlist = await getPlaylist()
      playlist.videos = playlist.videos?.filter(
        vid => !videosToDelete.some(vidToDelete => vidToDelete.reference === vid.reference)
      )

      const writer = new SwarmPlaylist.Writer(playlist, {
        beeClient,
      })
      writer.upload()
    },
    [beeClient, getPlaylist]
  )

  const deleteVideosFromIndex = useCallback(
    async (videos: VideoWithIndexes[]) => {
      for (const video of videos) {
        try {
          const indexId = video.indexesStatus?.[0]?.indexReference
          await indexClient.current!.videos.deleteVideo(indexId!)
        } catch (error) {
          const axiosError = error as AxiosError
          // set title for the error message
          axiosError.name = video.title ?? ""
          throw axiosError
        }
      }
    },
    [indexClient]
  )

  const deleteVideosFromSource = useCallback(
    async (videos: VideoWithIndexes[]) => {
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
    },
    [
      currentPage,
      opts.source.type,
      deleteVideosFromIndex,
      deleteVideosFromPlaylist,
      fetchPage,
      showError,
    ]
  )

  return {
    isFetching,
    total,
    videos,
    fetchPage,
    deleteVideosFromSource,
  }
}
