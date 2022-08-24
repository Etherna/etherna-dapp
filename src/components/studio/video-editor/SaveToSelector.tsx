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

import Toggle from "@/components/common/Toggle"
import Spinner from "@/components/common/Spinner"
import Label from "@/components/common/Label"
import FieldDesrcription from "@/components/common/FieldDesrcription"
import { useVideoEditorExtrasActions, useVideoEditorState } from "@/context/video-editor-context/hooks"
import useVideoPublishStatus from "@/hooks/useVideoPublishStatus"
import useSelector from "@/state/useSelector"
import type { PublishSourceType } from "@/definitions/video-editor-context"

const SaveToSelector: React.FC = () => {
  const address = useSelector(state => state.user.address)
  const [{ reference, sources }] = useVideoEditorState()
  const { saveTo, toggleAddTo, updateSources } = useVideoEditorExtrasActions()
  const [playlistIds, indexesUrls] = useMemo(() => {
    return [
      sources.filter(source => source.source === "playlist").map(source => source.identifier),
      sources.filter(source => source.source === "index").map(source => source.identifier),
    ]
  }, [sources])
  const { isFetching, videoIndexesStatus, videoPlaylistsStatus } = useVideoPublishStatus({
    reference,
    indexesUrls,
    playlistIds,
    ownerAddress: address!,
  })

  const isToggled = useCallback((source: PublishSourceType, identifier: string) => {
    return saveTo.find(s => s.source === source && s.identifier === identifier)!.add
  }, [saveTo])

  useEffect(() => {
    if (!videoIndexesStatus) return

    updateSources(sources.map(pubSource => ({
      ...pubSource,
      videoId: pubSource.source === "index"
        ? videoIndexesStatus[pubSource.identifier]?.videoId ?? pubSource.videoId
        : pubSource.videoId,
    })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoIndexesStatus])

  useEffect(() => {
    if (!videoIndexesStatus) return

    Object.keys(videoIndexesStatus).forEach(url => {
      const currentValue = isToggled("index", url)
      const toggle = currentValue
        ? videoIndexesStatus[url].status !== "public"
        : videoIndexesStatus[url].status === "public"

      toggle && toggleAddTo({
        source: "index" as "index" | "playlist",
        identifier: url,
        add: !currentValue,
      })
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

      toggle && toggleAddTo({
        source: "playlist" as "index" | "playlist",
        identifier: id,
        add: !currentValue,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPlaylistsStatus])

  return (
    <>
      <Label>Save to</Label>

      {isFetching ? (
        <Spinner />
      ) : (
        sources.map(source => {
          const toggled = isToggled(source.source, source.identifier)
          return (
            <Toggle
              checked={toggled}
              label={source.name}
              onChange={() => toggleAddTo({
                source: source.source,
                identifier: source.identifier,
                add: !toggled,
              })}
              key={source.identifier}
            />
          )
        })
      )}

      <FieldDesrcription>
        Choose where you want to post your video.
      </FieldDesrcription>
    </>
  )
}

export default SaveToSelector
