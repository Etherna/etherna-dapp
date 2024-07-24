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

import React, { useCallback, useEffect, useMemo } from "react"
import { urlHostname } from "@etherna/sdk-js/utils"
import { useQueries } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import FieldDescription from "@/components/common/FieldDescription"
import { Card, Spinner } from "@/components/ui/display"
import { SelectionToggle } from "@/components/ui/inputs"
import useVideoPublishStatus from "@/hooks/useVideoPublishStatus"
import { useChannelPlaylistsQuery } from "@/queries/channel-playlists-query"
import { usePlaylistQuery } from "@/queries/playlist-query"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"
import { ellipsis } from "@/utils/string"

import type { VideoEditorPublishSourceType } from "@/stores/video-editor"

type SaveToCardProps = {
  disabled?: boolean
}

const SaveToCard: React.FC<SaveToCardProps> = ({ disabled }) => {
  const address = useUserStore(state => state.address)
  const reference = useVideoEditorStore(state => state.reference)
  const saveTo = useVideoEditorStore(state => state.saveTo)
  const editorStatus = useVideoEditorStore(state => state.status)
  const togglePublishTo = useVideoEditorStore(state => state.togglePublishTo)
  const updateSaveTo = useVideoEditorStore(state => state.updateSaveTo)
  const indexes = useExtensionsStore(state => state.indexesList)

  const { isFetching, videoIndexesStatus, videoPlaylistsStatus } = useVideoPublishStatus({
    reference,
    ownerAddress: address!,
  })
  const channelPlaylistsQuery = useChannelPlaylistsQuery({ owner: address })
  const playlistsQueries = useQueries({
    queries: (channelPlaylistsQuery.data ?? []).map(rootManifest =>
      usePlaylistQuery.getQueryConfig({ playlistIdentification: { rootManifest } })
    ),
  })

  const isToggled = (source: VideoEditorPublishSourceType, identifier: string) => {
    return saveTo.find(s => s.source === source && s.identifier === identifier)?.add ?? false
  }

  useEffect(() => {
    const channelPlaylists = playlistsQueries.map(q => q.data).filter(Boolean)
    const isCreating = editorStatus === "creating"

    updateSaveTo([
      {
        source: "playlist",
        name: "Public channel",
        description: "Decentralized feed",
        identifier: SwarmPlaylist.Reader.channelPlaylistId,
        videoId: undefined,
        add: isCreating ? true : isToggled("playlist", SwarmPlaylist.Reader.channelPlaylistId),
      },
      ...channelPlaylists.map(playlist => ({
        source: "playlist" as const,
        name: playlist.preview.name,
        description: ellipsis(playlist.details.description ?? "", 25),
        identifier: playlist.preview.id,
        videoId: undefined,
        add: isCreating ? false : isToggled("playlist", playlist.preview.id),
      })),
      ...indexes.map(host => ({
        source: "index" as const,
        name: host.name,
        description: urlHostname(host.url) ?? "",
        identifier: host.url,
        videoId: videoIndexesStatus?.[host.url]?.videoId ?? undefined,
        add: isCreating ? true : isToggled("index", host.url),
      })),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...playlistsQueries.map(q => q.data)])

  useEffect(() => {
    if (saveTo.length === 0) return
    if (!videoIndexesStatus) return

    updateSaveTo(
      saveTo.map(pubSource => ({
        ...pubSource,
        videoId:
          pubSource.source === "index"
            ? (videoIndexesStatus[pubSource.identifier]?.videoId ?? pubSource.videoId)
            : pubSource.videoId,
      }))
    )

    Object.keys(videoIndexesStatus).forEach(url => {
      const currentValue = isToggled("index", url)
      const toggle = currentValue
        ? videoIndexesStatus[url].status !== "public"
        : videoIndexesStatus[url].status === "public"

      toggle && togglePublishTo("index", url, !currentValue)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoIndexesStatus])

  useEffect(() => {
    if (!videoPlaylistsStatus) return

    Object.keys(videoPlaylistsStatus).forEach(id => {
      const currentValue = isToggled("playlist", id)
      const toggle = currentValue
        ? videoPlaylistsStatus[id].status !== "public"
        : videoPlaylistsStatus[id].status === "public"

      toggle && togglePublishTo("playlist", id, !currentValue)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPlaylistsStatus])

  return (
    <Card title="Save to">
      {isFetching ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {saveTo.map(source => {
            const toggled = isToggled(source.source, source.identifier)
            return (
              <SelectionToggle
                checked={toggled}
                label={source.name}
                description={source.description}
                loading={isFetching}
                onChange={() => togglePublishTo(source.source, source.identifier, !toggled)}
                disabled={disabled}
                key={source.identifier}
              />
            )
          })}
        </div>
      )}
      <FieldDescription>Choose where you want to post your video.</FieldDescription>
    </Card>
  )
}

export default SaveToCard
