import { useCallback, useEffect, useMemo } from "react"
import type { Image } from "@etherna/api-js"
import type { VideoSource } from "@etherna/api-js/schemas/video"

import useErrorMessage from "./useErrorMessage"
import { THUMBNAIL_QUEUE_NAME } from "@/components/studio/video-editor/ThumbnailUpload"
import type { VideoEditorQueueType } from "@/stores/video-editor"
import useVideoEditorStore from "@/stores/video-editor"

type UseVideoEditorQueueOptions = {
  hasSelectedFile: boolean
  onUpload(queueId: string, progressCallback: (p: number) => void): Promise<void>
}

type ProcessingStatus = "select" | "preview" | "queued" | VideoEditorQueueType

export default function useVideoEditorQueue<S = Image | VideoSource>(
  name: string,
  opts: UseVideoEditorQueueOptions
) {
  const batchId = useVideoEditorStore(state => state.video.batchId)
  const batchStatus = useVideoEditorStore(state => state.batchStatus)
  const videoSources = useVideoEditorStore(state => state.video.sources)
  const thumbnail = useVideoEditorStore(state => state.video.thumbnail)
  const queue = useVideoEditorStore(state => state.queue)

  const updateQueueCompletion = useVideoEditorStore(state => state.updateQueueCompletion)
  const { showError } = useErrorMessage()

  const [currentQueue, currentSource] = useMemo(() => {
    const source: S | null | undefined =
      name === THUMBNAIL_QUEUE_NAME
        ? (thumbnail as S)
        : (videoSources.find(s => s.quality === name) as S)
    return [queue.find(q => q.name === name), source]
  }, [name, queue, thumbnail, videoSources])

  const processingStatus: ProcessingStatus = useMemo(() => {
    return currentSource
      ? "preview"
      : currentQueue
      ? currentQueue.type
      : !opts.hasSelectedFile
      ? "select"
      : "queued"
  }, [currentQueue, currentSource, opts.hasSelectedFile])

  const uploadSource = useCallback(async () => {
    if (!currentQueue) {
      return showError("Can't upload. Source not queued.")
    }

    await opts.onUpload(currentQueue.id, progress => {
      updateQueueCompletion(currentQueue.id, progress)
    })
  }, [currentQueue, opts, showError, updateQueueCompletion])

  // Processing automation

  useEffect(() => {
    if (processingStatus !== "upload") return
    if (!currentQueue || currentQueue.completion !== null) return
    if (!batchId || batchStatus !== undefined) return

    uploadSource()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueue?.id, processingStatus, batchId, batchStatus])

  name === THUMBNAIL_QUEUE_NAME && console.log(currentQueue, processingStatus, currentSource)

  return {
    processingStatus,
    currentQueue,
    currentSource,
  }
}
