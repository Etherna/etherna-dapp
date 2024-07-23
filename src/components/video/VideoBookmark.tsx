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
 *
 */

import React, { useState } from "react"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { useQueryClient } from "@tanstack/react-query"

import { BookmarkIcon } from "@heroicons/react/24/outline"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import { Button } from "@/components/ui/actions"
import { Spinner } from "@/components/ui/display"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useErrorMessage from "@/hooks/useErrorMessage"
import { usePlaylistQuery } from "@/queries/playlist-query"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"

import type { VideoWithIndexes } from "@/types/video"

interface VideoBookmarkProps {
  video: VideoWithIndexes
}

const VideoBookmark: React.FC<VideoBookmarkProps> = ({ video }) => {
  const owner = useUserStore(state => state.address)
  const [isLoading, setIsLoading] = useState(false)
  const beeClient = useClientsStore(state => state.beeClient)
  const defaultBatchId = useUserStore(state => state.defaultBatchId)
  const { fetchDefaultBatchIdOrCreate } = useDefaultBatch({
    autofetch: !defaultBatchId,
    saveAfterCreate: false,
  })
  const { showError } = useErrorMessage()

  const queryClient = useQueryClient()
  const savedPlaylistQuery = usePlaylistQuery({
    playlistIdentification: {
      id: SwarmPlaylist.Reader.savedPlaylistId,
      owner: owner!,
    },
    fillEmptyState: true,
    enabled: !!owner,
  })

  if (!owner || savedPlaylistQuery.isLoading) {
    return null
  }

  const isInPlaylist = savedPlaylistQuery.data?.details.videos.some(
    v => v.reference === video.reference
  )

  const toggleSave = async () => {
    const playlist = savedPlaylistQuery.data

    if (!playlist) {
      return showError("There was an error trying to load the playlist")
    }

    setIsLoading(true)

    let batchId = await fetchDefaultBatchIdOrCreate()

    if (!batchId) {
      setIsLoading(false)
      return showError("Default postage batch not loaded or not created yet")
    }

    try {
      const builder = new PlaylistBuilder()
      builder.initialize(playlist.reference, owner, playlist.preview, playlist.details)

      await builder.loadNode({ beeClient })

      if (isInPlaylist) {
        builder.removeVideos([video.reference])
      } else {
        builder.addVideos([video])
      }

      const writer = new SwarmPlaylist.Writer(builder, { beeClient })
      await writer.upload({ batchId })

      queryClient.setQueryData(
        usePlaylistQuery.getQueryKey({
          owner: owner!,
          id: SwarmPlaylist.Reader.savedPlaylistId,
        }),
        () => playlist
      )
      savedPlaylistQuery.refetch()
    } catch (error) {
      showError("There was an error trying to save the video", (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="size-7 p-1"
      color="transparent"
      disabled={isLoading || savedPlaylistQuery.isLoading}
      onClick={toggleSave}
    >
      {isLoading ? (
        <Spinner size={20} />
      ) : (
        <BookmarkIcon
          className={cn({
            "fill-current": isInPlaylist,
          })}
          width={20}
        />
      )}
    </Button>
  )
}

export default VideoBookmark
