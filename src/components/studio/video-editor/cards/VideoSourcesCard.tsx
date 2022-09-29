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
import type { VideoQuality, VideoSource } from "@etherna/api-js/schemas/video"
import classNames from "classnames"

import { PlusIcon } from "@heroicons/react/24/solid"

import VideoSourceProcessing from "@/components/studio/video-editor/VideoSourceProcessing"
import { Card } from "@/components/ui/display"
import type { VideoEditorQueue } from "@/stores/video-editor"
import useVideoEditorStore from "@/stores/video-editor"

type VideoSourcesCardProps = {
  disabled?: boolean
}

const VideoSourcesCard: React.FC<VideoSourcesCardProps> = ({ disabled }) => {
  const editorStatus = useVideoEditorStore(state => state.status)
  const videoSources = useVideoEditorStore(state => state.video.sources)
  const queue = useVideoEditorStore(state => state.queue)
  const addToQueue = useVideoEditorStore(state => state.addToQueue)

  useEffect(() => {
    const videoQueue = queue.filter(q => /[0-9]+p$/.test(q.name))
    if (editorStatus === "creating" && videoSources.length === 0 && videoQueue.length === 0) {
      addToQueue("upload", "source", "0p")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, videoSources.length])

  const getSourceIdentifier = useCallback(
    (source: VideoEditorQueue | VideoSource): VideoQuality => {
      return "quality" in source ? source.quality : (source.name as VideoQuality)
    },
    []
  )

  const sources: (VideoEditorQueue | VideoSource)[] = useMemo(() => {
    const sources: (VideoEditorQueue | VideoSource)[] = [
      ...videoSources,
      ...queue.filter(q => q.source === "source"),
    ]
    return sources.sort((a, b) => {
      const qualityA = parseInt(getSourceIdentifier(a))
      const qualityB = parseInt(getSourceIdentifier(b))
      return qualityB - qualityA
    })
  }, [videoSources, queue, getSourceIdentifier])

  const canManuallyAddSource = useMemo(() => {
    return !queue.some(queue => queue.name === "0p")
  }, [queue])

  const addQueue = useCallback(() => {
    addToQueue("upload", "source", "0p")
  }, [addToQueue])

  return (
    <Card title="Video sources">
      <div className="space-y-3">
        {sources.map(source => (
          <VideoSourceProcessing
            name={getSourceIdentifier(source)}
            disabled={disabled}
            key={"id" in source ? source.id : getSourceIdentifier(source)}
          />
        ))}

        {canManuallyAddSource && (
          <button
            className={classNames(
              "mt-4 flex w-full items-center space-x-2 rounded px-2 py-4",
              "text-sm font-medium text-gray-700 dark:text-gray-300",
              "bg-gray-900/5 active:bg-gray-200 dark:bg-gray-100/5 dark:active:bg-gray-800",
              "transition-colors duration-200"
            )}
            onClick={addQueue}
          >
            <PlusIcon width={20} aria-hidden />
            <span>Manually add lower quality source</span>
          </button>
        )}
      </div>
    </Card>
  )
}

export default VideoSourcesCard
