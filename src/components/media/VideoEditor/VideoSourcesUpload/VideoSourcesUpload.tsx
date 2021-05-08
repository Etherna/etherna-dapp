import React, { useImperativeHandle, useState, createRef, useEffect } from "react"
import { Canceler } from "axios"

import { useVideoEditorState } from "../context"
import Tab, { TabContent } from "@common/Tab"
import FileUploadFlow, { FileUploadFlowHandlers } from "@components/media/FileUploadFlow"
import FileUploadProgress from "@components/media/FileUploadProgress"
import SwarmVideo from "@classes/SwarmVideo"
import { VideoSource } from "@classes/SwarmVideo/types"
import { showError } from "@state/actions/modals"
import { getVideoDuration, getVideoResolution } from "@utils/media"
import { isMimeAudio, isMimeFFMpegEncodable } from "@utils/mimeTypes"

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
  const { videoHandler } = state
  const {
    updateOriginalQuality,
    updateVideoDuration,
    addToQueue,
    removeFromQueue,
    updateCompletion,
    resetState,
  } = actions
  const currentQueue = state.queue.find(q => !q.reference)
  const [sources, setSources] = useState<QueueSource[]>([defaultSource])

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
        const newSources = [...sources]
        newSources[index].canceler = c
        setSources(newSources)
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
    if (index !== 0) return

    const duration = await getVideoDuration(file)
    const quality = await getVideoResolution(file)

    updateVideoDuration(duration)
    updateOriginalQuality(`${quality}p`)

    const newSources = [...sources]
    newSources[index].quality = `${quality}p`
    newSources[index].contentType = isMimeFFMpegEncodable(file.type)
      ? isMimeAudio(file.type) ? "audio/mpeg" : "video/mp4"
      : file.type
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
