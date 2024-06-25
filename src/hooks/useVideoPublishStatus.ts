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

import useMounted from "./useMounted"
import IndexClient from "@/classes/IndexClient"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"

import type { EthAddress } from "@etherna/sdk-js/clients"

export type UseVideoPublishStatusOptions = {
  reference?: string | undefined
  indexesUrls: string[]
  playlistIds: string[]
  ownerAddress: EthAddress
}

type PublishStatus = {
  status: "public" | "unindexed" | "error"
  videoId: string | undefined
}

export default function useVideoPublishStatus(opts: UseVideoPublishStatusOptions) {
  const beeClient = useClientsStore(state => state.beeClient)
  const [isFetchingIndexes, setIsFetchingIndexes] = useState(false)
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const [videoIndexesStatus, setVideoIndexesStatus] = useState<Record<string, PublishStatus>>()
  const [videoPlaylistsStatus, setVideoPlaylistsStatus] = useState<Record<string, PublishStatus>>()
  const mounted = useMounted()
  const currentIndexesUrls = useRef<string[]>([])
  const currentPlaylistsIds = useRef<string[]>([])

  useEffect(() => {
    const hasChanges =
      opts.indexesUrls.length > 0 &&
      opts.indexesUrls?.some(url => currentIndexesUrls.current.indexOf(url) === -1)

    if (opts.reference && hasChanges) {
      currentIndexesUrls.current = opts.indexesUrls
      fetchIndexesStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.reference, opts.indexesUrls])

  useEffect(() => {
    const hasChanges =
      opts.playlistIds.length > 0 &&
      opts.playlistIds?.some(id => currentPlaylistsIds.current.indexOf(id) === -1)

    if (opts.reference && hasChanges) {
      currentPlaylistsIds.current = opts.playlistIds
      fetchPlaylistsStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.reference, opts.playlistIds])

  const fetchPlaylistsStatus = useCallback(async () => {
    if (!opts.reference) return
    if (!mounted.current) return

    setIsFetchingPlaylists(true)

    const videoPlaylistsStatus: Record<string, PublishStatus> = {}

    for (const playlistId of opts.playlistIds) {
      const reader = new SwarmPlaylist.Reader(playlistId, opts.ownerAddress, {
        beeClient,
      })

      const publishStatus: PublishStatus = {
        status: "unindexed",
        videoId: undefined,
      }

      try {
        const playlist = await reader.download()
        const status = playlist.videos?.some(vid => vid.reference === opts.reference)
          ? "public"
          : "unindexed"
        publishStatus.status = status
      } catch (error) {
        publishStatus.status = "error"
      }

      videoPlaylistsStatus[playlistId] = publishStatus
    }

    mounted.current && setVideoPlaylistsStatus(videoPlaylistsStatus)
    mounted.current && setIsFetchingPlaylists(false)
  }, [beeClient, mounted, opts.ownerAddress, opts.playlistIds, opts.reference])

  const fetchIndexesStatus = useCallback(async () => {
    if (!opts.reference) return
    if (!mounted.current) return

    setIsFetchingIndexes(true)

    const videoIndexesStatus: Record<string, PublishStatus> = {}

    for (const indexUrl of opts.indexesUrls) {
      const indexClient = new IndexClient(indexUrl)

      const publishStatus: PublishStatus = {
        status: "unindexed",
        videoId: undefined,
      }

      try {
        const indexVideo = await indexClient.videos.fetchVideoFromHash(opts.reference)
        publishStatus.status = "public"
        publishStatus.videoId = indexVideo.id
      } catch (error) {
        console.error(error)
        publishStatus.status = "error"
      }

      videoIndexesStatus[indexUrl] = publishStatus
    }

    mounted.current && setVideoIndexesStatus(videoIndexesStatus)
    mounted.current && setIsFetchingIndexes(false)
  }, [opts.reference, opts.indexesUrls, mounted])

  return {
    isFetching: isFetchingIndexes || isFetchingPlaylists,
    videoIndexesStatus,
    videoPlaylistsStatus,
  }
}
