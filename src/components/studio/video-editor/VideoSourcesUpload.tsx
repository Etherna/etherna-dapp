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

import React, { useImperativeHandle, useState, createRef, useEffect } from "react"
import { Canceler } from "axios"

import classes from "@styles/components/studio/video-editor/VideoSourcesUpload.module.scss"
import { ReactComponent as PlusIcon } from "@assets/icons/plus.svg"

import Button from "@common/Button"
import VideoSourcePreview from "@components/media/VideoSourcePreview"
import VideoSourceStats from "@components/media/VideoSourceStats"
import FileUploadFlow, { FileUploadFlowHandlers } from "@components/media/FileUploadFlow"
import FileUploadProgress from "@components/media/FileUploadProgress"
import SwarmVideoIO from "@classes/SwarmVideo"
import {
  useVideoEditorBaseActions,
  useVideoEditorQueueActions,
  useVideoEditorState
} from "@context/video-editor-context/hooks"
import { useErrorMessage } from "@state/hooks/ui"
import { getVideoDuration, getVideoResolution } from "@utils/media"
import { isMimeWebCompatible } from "@utils/mime-types"
import type { SwarmVideoQuality, VideoSource } from "@definitions/swarm-video"

type QueueSource = {
  quality: SwarmVideoQuality | null
  contentType: string | null
  key: string
  canceler?: Canceler
  ref: React.MutableRefObject<FileUploadFlowHandlers | null>
}

type VideoSourcesUploadProps = {
  initialDragPortal?: string
  initialSources?: VideoSource[]
  disabled?: boolean
  onComplete?: () => void
  onCancel?: (name: string) => void
}

export type VideoSourcesUploadHandlers = {
  clear: () => void
}

const sourceKey = () => Math.random().toString(36).substring(7)

const defaultSource = (): QueueSource => ({
  key: sourceKey(),
  quality: null,
  contentType: null,
  ref: createRef()
})

const VideoSourcesUpload = React.forwardRef<VideoSourcesUploadHandlers, VideoSourcesUploadProps>(({
  initialDragPortal,
  disabled,
  onComplete,
  onCancel
}, ref) => {
  const [{ videoWriter, queue }] = useVideoEditorState()
  const currentQueue = queue.find(q => !q.reference)
  const [sources, setSources] = useState<QueueSource[]>([defaultSource()])

  const { resetState, updateOriginalQuality, updateVideoDuration } = useVideoEditorBaseActions()
  const { addToQueue, removeFromQueue, updateQueueCompletion, updateQueueName } = useVideoEditorQueueActions()
  const { showError } = useErrorMessage()

  useEffect(() => {
    setSources(
      videoWriter.sources.length === 0 ? (
        [defaultSource()]
      ) : (
        videoWriter.sources.map(source => ({
          key: sourceKey(),
          quality: source.quality,
          contentType: null,
          ref: createRef()
        }))
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!queue.length) {
      // empty queue = reset
      setSources([defaultSource()])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue])

  useImperativeHandle(ref, () => ({
    clear() {
      sources.forEach(s => s.ref.current?.clear())
      setSources([defaultSource()])
      resetState()
    }
  }))

  const addSource = () => {
    const newSources = [...sources]
    newSources.push({
      key: sourceKey(),
      quality: null,
      contentType: null,
      ref: createRef(),
    })
    setSources(newSources)
  }

  const uploadSource = async (buffer: ArrayBuffer, index: number) => {
    const source = sources[index]
    const queueName = SwarmVideoIO.getSourceName(source.quality)

    const reference = await videoWriter.addVideoSource(buffer, source.contentType!, {
      onCancelToken: c => {
        setSources(sources => {
          const newSources = [...sources]
          newSources[index].canceler = c

          return newSources
        })
      },
      onUploadProgress: p => updateQueueCompletion(queueName, p)
    })

    updateQueueCompletion(queueName, 100, reference)
    onComplete?.()

    // Sort sources
    setSources(sources => {
      const sortedSources = sources.sort((a, b) => {
        return SwarmVideoIO.getSourceQuality(b.quality) - SwarmVideoIO.getSourceQuality(a.quality)
      })
      return [...sortedSources]
    })

    return reference
  }

  const removeSource = async (index: number) => {
    try {
      const queueName = SwarmVideoIO.getSourceName(sources[index].quality)

      await videoWriter.removeVideoSource(sources[index].quality!)

      const newSources = [...sources]
      newSources.splice(index, 1)
      setSources(newSources)

      removeFromQueue(queueName)
    } catch (error: any) {
      showError("Error", error.message)
    }
  }

  const handleFileSelected = async (file: File, index: number) => {
    let duration = 0
    let quality = 0

    if (isMimeWebCompatible(file.type)) {
      duration = await getVideoDuration(file)
      quality = await getVideoResolution(file)

      if (index === 0) {
        updateVideoDuration(duration)
        updateOriginalQuality(SwarmVideoIO.getSourceName(quality))
      }
    }

    const newSources = [...sources]
    newSources[index].quality = SwarmVideoIO.getSourceName(quality)
    newSources[index].contentType = file.type
    setSources(newSources)

    const queueName = SwarmVideoIO.getSourceName(quality)
    addToQueue(queueName)
  }

  const handleFileEncoded = (contentType: string, duration: number, quality: number, index: number) => {
    if (index !== 0) return

    const originalQueueName = SwarmVideoIO.getSourceName(sources[index].quality)
    const queueName = SwarmVideoIO.getSourceName(quality)

    if (originalQueueName !== queueName) {
      updateQueueName(originalQueueName, queueName)
    }

    if (index === 0) {
      updateVideoDuration(duration)
      updateOriginalQuality(queueName)
    }

    const newSources = [...sources]
    newSources[index].quality = queueName
    newSources[index].contentType = contentType
    setSources(newSources)

    addToQueue(queueName)
  }

  const handleCancelUpload = (index: number) => {
    const { quality, canceler, ref } = sources[index]

    if (canceler) {
      canceler("User canceled the upload.")
    }

    ref.current?.clear()

    if (index > 0) {
      removeSource(index)
    } else {
      const newSources = [...sources]
      newSources[index].quality = null
      newSources[index].contentType = null

      setSources(newSources)

      const sourceName = SwarmVideoIO.getSourceName(quality)
      updateQueueCompletion(sourceName, 0, undefined)
    }
  }

  const handleSourceReset = (name: SwarmVideoQuality) => {
    removeFromQueue(name)
    onCancel?.(name)
  }

  return (
    <div className={classes.videoSourcesUpload}>
      {sources.map((source, i) => {
        const queueName = SwarmVideoIO.getSourceName(source.quality)
        const thisQueue = queue.find(q => q.name === queueName)
        const finished = !!thisQueue?.reference
        const videoSource = videoWriter.sources.find(source => source.quality === queueName)

        return (
          <FileUploadFlow
            ref={source.ref}
            fileDragPortal={i === 0 && initialDragPortal ? initialDragPortal : undefined}
            reference={thisQueue?.reference}
            dragLabel={"Drag your video here"}
            acceptTypes={["video"]}
            sizeLimit={100}
            canProcessFile={currentQueue?.name === queueName}
            uploadHandler={buffer => uploadSource(buffer, i)}
            onFileSelected={file => handleFileSelected(file, i)}
            onEncodingComplete={
              (contentType, duration, quality) => handleFileEncoded(contentType, duration, quality, i)
            }
            onCancel={() => handleSourceReset(queueName)}
            disabled={disabled}
            key={source.key}
          >
            {({ isUploading }) => (
              <VideoSourcePreview
                name={queueName}
                statusText={finished ? undefined : isUploading ? "uploading" : "queued"}
                actionsRender={
                  <>
                    {(i > 0 && !isUploading) && (
                      <Button aspect="link" onClick={() => removeSource(i)} disabled={disabled}>
                        Remove
                      </Button>
                    )}
                    {isUploading && (
                      <Button aspect="link" onClick={() => handleCancelUpload(i)} disabled={disabled}>
                        Cancel
                      </Button>
                    )}
                  </>
                }
              >
                {isUploading && (
                  <FileUploadProgress progress={currentQueue?.completion ?? 10} />
                )}

                {!isUploading && !finished && (
                  <p>Waiting to upload...</p>
                )}

                {finished && (
                  <VideoSourceStats
                    source={videoSource}
                    srcUrl={videoWriter.getSourceUrl(queueName)}
                  />
                )}
              </VideoSourcePreview>
            )}
          </FileUploadFlow>
        )
      })}

      {sources[0].quality && (
        <button className={classes.videoSourcesUploadAddBtn} onClick={addSource}>
          <PlusIcon />
          <span>Manually add lower quality source</span>
        </button>
      )}
    </div>
  )
})

export default VideoSourcesUpload
