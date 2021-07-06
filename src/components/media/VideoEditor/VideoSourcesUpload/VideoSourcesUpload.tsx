import React, { useImperativeHandle, useState, createRef, useEffect } from "react"
import { Canceler } from "axios"

import { useVideoEditorState } from "../context"
import Tab, { TabContent } from "@common/Tab"
import FileUploadFlow, { FileUploadFlowHandlers } from "@components/media/FileUploadFlow"
import FileUploadProgress from "@components/media/FileUploadProgress"
import SwarmVideo from "@classes/SwarmVideo"
import { VideoSource } from "@classes/SwarmVideo/types"
import { useErrorMessage } from "@state/hooks/ui"
import { getVideoDuration, getVideoResolution } from "@utils/media"
import { isMimeAudio, isMimeFFMpegEncodable, isMimeWebCompatible } from "@utils/mimeTypes"

type QueueSource = {
  quality: string | null
  contentType: string | null
  canceler?: Canceler
  ref: React.MutableRefObject<FileUploadFlowHandlers | null>
}

type VideoSourcesUploadProps = {
  initialSources?: VideoSource[]
  disabled?: boolean
  onComplete?: () => void
  onCancel?: (name: string) => void
}

export type VideoSourcesUploadHandlers = {
  clear: () => void
}

const defaultSource: QueueSource = { quality: null, contentType: null, ref: createRef() }

const VideoSourcesUpload = React.forwardRef<VideoSourcesUploadHandlers, VideoSourcesUploadProps>(({
  disabled,
  onComplete,
  onCancel
}, ref) => {
  const { state, actions } = useVideoEditorState()
  const { videoHandler, queue } = state
  const {
    updateOriginalQuality,
    updateVideoDuration,
    updateQueueName,
    addToQueue,
    removeFromQueue,
    updateCompletion,
    resetState,
  } = actions
  const currentQueue = state.queue.find(q => !q.reference)
  const [sources, setSources] = useState<QueueSource[]>([defaultSource])
  const { showError } = useErrorMessage()

  useEffect(() => {
    setSources(
      videoHandler.sources.length === 0 ? (
        [defaultSource]
      ) : (
        videoHandler.sources.map(source => ({
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
      setSources([defaultSource])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue])

  useImperativeHandle(ref, () => ({
    clear() {
      sources.forEach(s => s.ref.current?.clear())
      setSources([defaultSource])
      resetState()
    }
  }))

  const addSource = () => {
    const newSources = [...sources]
    newSources.push({
      quality: null,
      contentType: null,
      ref: createRef(),
    })
    setSources(newSources)
  }

  const uploadSource = async (buffer: ArrayBuffer, index: number) => {
    const source = sources[index]
    const queueName = SwarmVideo.getSourceName(source.quality)

    const reference = await videoHandler.addVideoSource(buffer, source.contentType!, {
      onCancelToken: c => {
        setSources(sources => {
          const newSources = [...sources]
          newSources[index].canceler = c

          return newSources
        })
      },
      onUploadProgress: p => updateCompletion(queueName, p)
    })

    updateCompletion(queueName, 100, reference)
    onComplete?.()

    return reference
  }

  const removeSource = async (index: number) => {
    try {
      const queueName = SwarmVideo.getSourceName(sources[index].quality)

      await videoHandler.removeVideoSource(sources[index].quality!)

      const newSources = [...sources]
      newSources.splice(index, 1)
      setSources(newSources)

      removeFromQueue(queueName)
    } catch (error) {
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
        updateOriginalQuality(`${quality}p`)
      }
    }

    const newSources = [...sources]
    newSources[index].quality = `${quality}p`
    newSources[index].contentType = isMimeFFMpegEncodable(file.type)
      ? isMimeAudio(file.type) ? "audio/mpeg" : "video/mp4"
      : file.type
    setSources(newSources)
  }

  const handleFileEncoded = (contentType: string, duration: number, quality: number, index: number) => {
    if (index !== 0) return

    const originalQueueName = videoHandler.video.originalQuality ?? "0p"
    const queueName = `${quality}p`

    if (originalQueueName !== queueName) {
      updateQueueName(originalQueueName, queueName)
    }

    updateVideoDuration(duration)
    updateOriginalQuality(queueName)

    const newSources = [...sources]
    newSources[index].quality = queueName
    newSources[index].contentType = contentType
    setSources(newSources)
  }

  const handleReset = (name: string) => {
    removeFromQueue(name)

    onCancel?.(name)
  }

  return (
    <div>
      <label htmlFor="video">Video sources</label>
      <Tab
        defaultKey={`quality-1`}
        canAddRemoveTabs={true}
        onTabAdded={addSource}
        onTabRemoved={removeSource}
        canRemoveTab={i => i !== 0}
      >
        {sources.map((source, i) => {
          const title = source.quality
            ? `${i === 0 ? `Original - ` : ``}${source.quality}`
            : `${i === 0 ? `Original` : `<add source>`}`
          const queueName = SwarmVideo.getSourceName(source.quality)
          const queue = state.queue.find(q => q.name === queueName)
          const finished = !!queue?.reference
          return (
            <TabContent tabKey={`quality-${i + 1}`} title={title} key={i}>
              {currentQueue?.completion && !finished && (
                <FileUploadProgress
                  progress={currentQueue.completion}
                  disabled={disabled}
                  canceler={source.canceler}
                  onCancelUpload={() => handleReset(queueName)}
                />
              )}
              <FileUploadFlow
                ref={source.ref}
                reference={queue?.reference}
                dragLabel={"Drag your video here"}
                acceptTypes={["video", "audio"]}
                sizeLimit={100}
                canProcessFile={queue?.name === queueName}
                uploadHandler={buffer => uploadSource(buffer, i)}
                onFileSelected={file => handleFileSelected(file, i)}
                onEncodingComplete={
                  (contentType, duration, quality) => handleFileEncoded(contentType, duration, quality, i)
                }
                onConfirmedProcessing={() => addToQueue(queueName)}
                onCancel={() => handleReset(queueName)}
                disabled={disabled}
                key={i}
              />
            </TabContent>
          )
        })}
      </Tab>
    </div>
  )
})

export default VideoSourcesUpload
