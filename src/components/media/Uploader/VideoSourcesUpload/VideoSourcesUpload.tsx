import React, { useImperativeHandle, useState, createRef, useEffect } from "react"

import FileUploadFlow, { FileUploadHandlers } from "../FileUploadFlow"
import { useUploaderState } from "../UploaderContext"
import Tab, { TabContent } from "@common/Tab"
import { showError } from "@state/actions/modals"
import { deleteVideoSource, VideoSourceInfo } from "@utils/video"

type VideoSource = {
  quality: string|null
  ref: React.MutableRefObject<FileUploadHandlers|null>
}

type VideoSourcesUploadProps = {
  initialSources?: VideoSourceInfo[]
  pinContent?: boolean
  disabled?: boolean
  onComplete?: () => void
  onCancel?: (name: string) => void
}

export type VideoSourcesUploadHandlers = {
  clear: () => void
}

const VideoSourcesUpload = React.forwardRef<VideoSourcesUploadHandlers, VideoSourcesUploadProps>(({
  initialSources,
  pinContent,
  disabled,
  onComplete,
  onCancel
}, ref) => {
  const { state, actions } = useUploaderState()
  const { manifest } = state
  const {
    updateManifest,
    updateOriginalQuality,
    updateVideoDuration,
    addToQueue,
    removeFromQueue,
    updateCompletion,
    resetState,
  } = actions
  const currentQueue = state.queue.find(q => !q.finished)
  const defaultSource: VideoSource = { quality: null, ref: createRef() }
  const [sources, setSources] = useState<VideoSource[]>([defaultSource])

  useEffect(() => {
    if (initialSources && initialSources.length) {
      const sources = initialSources.map(source => ({
        quality: source.quality,
        ref: createRef(),
      } as VideoSource))
      setSources(sources)
    }
  }, [initialSources])

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
      ref: createRef(),
    })
    setSources(newSources)
  }

  const removeSource = async (index: number) => {
    try {
      const queueName = `sources/${sources[index].quality}`
      const queue = state.queue.find(q => q.name === queueName)

      if (queue && queue.finished) {
        const hash = await deleteVideoSource(sources[index].quality, manifest)
        hash && updateManifest(hash)
      }

      const newSources = [...sources]
      newSources.splice(index, 1)
      setSources(newSources)

      removeFromQueue(queueName)
    } catch (error) {
      showError("Error", error.message)
    }
  }

  const handleHashUpdate = (hash: string|undefined, name: string) => {
    const queue = state.queue.find(q => q.name === name)
    if (hash && queue) {
      updateManifest(hash)
      updateCompletion(name, 100, true)

      onComplete && onComplete()
    }
  }

  const handleUpdateDuration = (duration: number|undefined, index: number) => {
    if (!duration) return

    index === 0 && updateVideoDuration(duration)
  }

  const handleUpdateQuality = (quality: string|undefined, index: number) => {
    if (!quality) return

    index === 0 && updateOriginalQuality(quality)

    const newSources = [...sources]
    newSources[index].quality = quality
    setSources(newSources)
  }

  const handleProgress = (progress: number|undefined, index: number) => {
    const quality = sources[index].quality
    updateCompletion(`sources/${quality}`, progress || 0)
  }

  const handleReset = (name: string) => {
    removeFromQueue(name)

    onCancel && onCancel(name)
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
          const queue = state.queue.find(q => q.name === `sources/${source.quality}`)
          const finished = queue && queue.finished === true
          return (
            <TabContent tabKey={`quality-${i + 1}`} title={title} key={i}>
              <FileUploadFlow
                ref={source.ref}
                hash={finished ? manifest : undefined}
                label={title}
                dragLabel={"Drag your video here"}
                acceptTypes={["video", "audio"]}
                sizeLimit={100}
                pinContent={pinContent}
                manifest={manifest}
                path={`sources/${source.quality}`}
                canProcessFile={currentQueue && currentQueue.name === `sources/${source.quality}`}
                onConfirmedProcessing={() => addToQueue(`sources/${source.quality}`)}
                onHashUpdate={hash => handleHashUpdate(hash, `sources/${source.quality}`)}
                onQualityUpdate={quality => handleUpdateQuality(quality, i)}
                onDurationUpdate={duration => handleUpdateDuration(duration, i)}
                onProgressChange={progress => handleProgress(progress, i)}
                onCancel={() => handleReset(`sources/${source.quality}`)}
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
