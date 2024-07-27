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

import useChannelPlaylists from "./useChannelPlaylists"
import useMounted from "./useMounted"
import IndexClient from "@/classes/IndexClient"
import useExtensionsStore from "@/stores/extensions"

import type { EthAddress } from "@etherna/sdk-js/clients"

export type UseVideoPublishStatusOptions = {
  reference?: string | undefined
  ownerAddress: EthAddress
}

type PublishStatus = {
  status: "public" | "unindexed" | "error"
  videoId: string | undefined
}

export default function useVideoPublishStatus(opts: UseVideoPublishStatusOptions) {
  const [isFetchingIndexes, setIsFetchingIndexes] = useState(false)
  const [videoIndexesStatus, setVideoIndexesStatus] = useState<Record<string, PublishStatus>>()
  const [videoPlaylistsStatus, setVideoPlaylistsStatus] = useState<Record<string, PublishStatus>>()
  const mounted = useMounted()

  const indexesUrl = useExtensionsStore(state => state.indexesList.map(index => index.url))
  const { allPlaylists, isFetchingPlaylists } = useChannelPlaylists({ mode: "all" })

  useEffect(() => {
    if (opts.reference) {
      fetchIndexesStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, opts.reference])

  useEffect(() => {
    if (opts.reference && !isFetchingPlaylists) {
      fetchPlaylistsStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, opts.reference, isFetchingPlaylists])

  const fetchPlaylistsStatus = useCallback(async () => {
    if (!opts.reference) return
    if (!mounted.current) return

    const videoPlaylistsStatus: Record<string, PublishStatus> = {}

    for (const playlist of allPlaylists) {
      const status = playlist.details.videos.some(vid => vid.reference === opts.reference)
        ? ("public" as const)
        : ("unindexed" as const)
      videoPlaylistsStatus[playlist.preview.id] = { status, videoId: undefined }
    }

    setVideoPlaylistsStatus(videoPlaylistsStatus)
  }, [allPlaylists, mounted, opts.reference])

  const fetchIndexesStatus = useCallback(async () => {
    if (!opts.reference) return
    if (!mounted.current) return

    setIsFetchingIndexes(true)

    const videoIndexesStatus: Record<string, PublishStatus> = {}

    for (const indexUrl of indexesUrl) {
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
  }, [opts.reference, indexesUrl, mounted])

  return {
    isFetching: isFetchingIndexes || isFetchingPlaylists,
    videoIndexesStatus,
    videoPlaylistsStatus,
  }
}
