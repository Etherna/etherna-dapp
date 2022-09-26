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
import { urlHostname } from "@etherna/api-js/utils"

import FieldDescription from "@/components/common/FieldDescription"
import { Card, Spinner } from "@/components/ui/display"
import { SelectionToggle } from "@/components/ui/inputs"
import useVideoPublishStatus from "@/hooks/useVideoPublishStatus"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import type { VideoEditorPublishSourceType } from "@/stores/video-editor"
import useVideoEditorStore from "@/stores/video-editor"

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

  const [playlistIds, indexesUrls] = useMemo(() => {
    return [
      saveTo.filter(source => source.source === "playlist").map(source => source.identifier),
      saveTo.filter(source => source.source === "index").map(source => source.identifier),
    ]
  }, [saveTo])
  const { isFetching, videoIndexesStatus, videoPlaylistsStatus } = useVideoPublishStatus({
    reference,
    indexesUrls,
    playlistIds,
    ownerAddress: address!,
  })

  const isToggled = useCallback(
    (source: VideoEditorPublishSourceType, identifier: string) => {
      return saveTo.find(s => s.source === source && s.identifier === identifier)!.add
    },
    [saveTo]
  )

  useEffect(() => {
    updateSaveTo([
      {
        source: "playlist",
        name: "Public channel",
        description: "Decentralized feed",
        identifier: "__channel",
        videoId: undefined,
        add: editorStatus === "creating",
      },
      ...indexes.map(host => ({
        source: "index" as const,
        name: host.name,
        description: urlHostname(host.url) ?? "",
        identifier: host.url,
        videoId: undefined,
        add: editorStatus === "creating",
      })),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (saveTo.length === 0) return
    if (!videoIndexesStatus) return

    updateSaveTo(
      saveTo.map(pubSource => ({
        ...pubSource,
        videoId:
          pubSource.source === "index"
            ? videoIndexesStatus[pubSource.identifier]?.videoId ?? pubSource.videoId
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
  }, [saveTo, videoPlaylistsStatus])

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
