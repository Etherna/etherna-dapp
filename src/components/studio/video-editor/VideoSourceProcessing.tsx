import React, { useCallback, useMemo, useRef, useState } from "react"

import { MinusIcon } from "@heroicons/react/24/outline"
import { ExclamationCircleIcon } from "@heroicons/react/24/solid"

import { PORTAL_ID } from "./VideoEditor"
import FileDrag from "@/components/media/FileDrag"
import FileUploadProgress from "@/components/media/FileUploadProgress"
import VideoSourceStats from "@/components/media/VideoSourceStats"
import { Button } from "@/components/ui/actions"
import { Alert, Card, Text } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"
import useVideoEditorQueue from "@/hooks/useVideoEditorQueue"
import useClientsStore from "@/stores/clients"
import useVideoEditorStore from "@/stores/video-editor"
import { getVideoDuration, getVideoResolution } from "@/utils/media"
import { isMimeWebCompatible } from "@/utils/mime-types"

import type { VideoQuality, VideoSource } from "@etherna/api-js/schemas/video"

type VideoSourceProcessingProps = {
  name: VideoQuality
  disabled?: boolean
}

const VideoSourceProcessing: React.FC<VideoSourceProcessingProps> = ({ name, disabled }) => {
  const beeClient = useClientsStore(state => state.beeClient)
  const queue = useVideoEditorStore(state => state.queue)
  const batchId = useVideoEditorStore(state => state.video.batchId)
  const batchStatus = useVideoEditorStore(state => state.batchStatus)
  const pinContent = useVideoEditorStore(state => state.pinContent)
  const originalQuality = useVideoEditorStore(state => state.video.originalQuality)
  const videoSources = useVideoEditorStore(state => state.video.sources)
  const [selectedFile, setSelectedFile] = useState<File>()
  const abortController = useRef<AbortController>()

  const addVideoSource = useVideoEditorStore(state => state.addVideoSource)
  const removeFromQueue = useVideoEditorStore(state => state.removeFromQueue)
  const removeVideoSource = useVideoEditorStore(state => state.removeVideoSource)
  const setQueueError = useVideoEditorStore(state => state.setQueueError)
  const updateMetadata = useVideoEditorStore(state => state.updateMetadata)
  const updateQueueCompletion = useVideoEditorStore(state => state.updateQueueCompletion)
  const updateQueueName = useVideoEditorStore(state => state.updateQueueName)
  const updateQueueSize = useVideoEditorStore(state => state.updateQueueSize)
  const updateQueueError = useVideoEditorStore(state => state.updateQueueError)
  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()

  const shouldPortal = useMemo(() => {
    return videoSources.length === 0 && name === "0p"
  }, [name, videoSources])

  const getSourceQuality = useCallback((quality: number | string | null): number => {
    return quality ? parseInt(quality.toString()) : 0
  }, [])

  const getSourceName = useCallback(
    (quality: number | string | null): VideoQuality => {
      return `${getSourceQuality(quality)}p`
    },
    [getSourceQuality]
  )

  const uploadSource = useCallback(
    async (queueId: string, progressCallback: (p: number) => void) => {
      if (!selectedFile) {
        return setQueueError(queueId, "Can't upload. No file selected.")
      }

      const duration = await getVideoDuration(selectedFile)
      const size = selectedFile.size
      const bitrate = Math.round((size * 8) / duration)

      try {
        abortController.current = new AbortController()
        const { reference } = await beeClient.bzz.upload(selectedFile, {
          batchId: batchId!,
          contentType: "video/mp4",
          pin: pinContent,
          signal: abortController.current.signal,
          onUploadProgress: p => {
            progressCallback(p)
          },
        })

        // remove data
        setSelectedFile(undefined)

        // will also be removed from queue
        addVideoSource(name, reference, size, bitrate, beeClient.bzz.url(reference))
      } catch (error) {
        console.error(error)
        updateQueueError(queueId, "There was an error uploading the video.")
      }
    },
    [
      name,
      selectedFile,
      beeClient,
      batchId,
      pinContent,
      setQueueError,
      addVideoSource,
      updateQueueError,
    ]
  )

  const processingOptions = useMemo(() => {
    return {
      hasSelectedFile: !!selectedFile,
      onUpload: uploadSource,
    }
  }, [selectedFile, uploadSource])

  const { processingStatus, currentQueue, currentSource } = useVideoEditorQueue<VideoSource>(
    name,
    processingOptions
  )

  const handleCancelUpload = useCallback(() => {
    abortController.current?.abort("User canceled the upload.")
    currentQueue && updateQueueCompletion(currentQueue.id, 0)
  }, [currentQueue, updateQueueCompletion])

  const canSelectFile = useCallback(
    async (file: File) => {
      if (!file) {
        showError("Error", "The selected file is not supported")
        return false
      }

      if (!isMimeWebCompatible(file.type)) {
        showError("Error", "The selected file is not supported")
        return false
      }

      const quality = await getVideoResolution(file)
      const duration = await getVideoDuration(file)

      if (!duration || !quality) {
        showError(
          "Cannot add source",
          `The coded used for this video is not web compatible. Please encode this video with a different codec.`
        )
        return false
      }

      const queueName = getSourceName(quality)
      const hasQuality = videoSources.some(q => q.quality === queueName)

      if (hasQuality) {
        showError("Cannot add source", `There is already a source with the quality ${quality}p`)
        return false
      }

      return true
    },
    [getSourceName, showError, videoSources]
  )

  const handleFileSelected = useCallback(
    async (file: File) => {
      const duration = await getVideoDuration(file)
      const quality = await getVideoResolution(file)

      const queueName = getSourceName(quality)
      const sourceQueue = queue.find(q => q.name === queueName)
      const hasQuality = videoSources.some(q => q.quality === queueName)
      const currentOriginalQuality = getSourceQuality(originalQuality)

      if (hasQuality) {
        return showError(
          "Cannot add source",
          `There is already a source with the quality ${quality}p`
        )
      }

      if (sourceQueue) {
        removeFromQueue(sourceQueue.id)
      }

      if (isNaN(currentOriginalQuality) || quality > currentOriginalQuality) {
        updateMetadata(getSourceName(quality), duration)
      }

      setSelectedFile(file)

      updateQueueName(currentQueue!.id, queueName)
      updateQueueSize(currentQueue!.id, file.size)
    },
    [
      queue,
      videoSources,
      originalQuality,
      currentQueue,
      getSourceName,
      getSourceQuality,
      updateQueueName,
      updateQueueSize,
      showError,
      removeFromQueue,
      updateMetadata,
    ]
  )

  const removeSource = useCallback(async () => {
    if (
      await waitConfirmation(
        "Are you sure you want to remove this source?",
        "",
        "Yes, remove",
        "destructive"
      )
    ) {
      handleCancelUpload()
      currentQueue?.id && removeFromQueue(currentQueue.id)
      removeVideoSource(name)
    }
  }, [name, currentQueue, waitConfirmation, handleCancelUpload, removeFromQueue, removeVideoSource])

  const canRemove = useMemo(() => {
    if (currentQueue) return true
    if (currentSource) return currentSource.quality !== originalQuality
    return false
  }, [currentQueue, currentSource, originalQuality])

  return (
    <Card
      title={name !== "0p" ? name : ""}
      variant="fill"
      actions={
        <>
          {canRemove && (
            <Button
              color="warning"
              aspect="outline"
              prefix={<MinusIcon width={18} strokeWidth={2.5} />}
              rounded
              small
              onClick={removeSource}
            >
              {processingStatus === "preview" ? "Remove" : "Cancel"}
            </Button>
          )}
        </>
      }
    >
      {processingStatus === "select" && !selectedFile && (
        <FileDrag
          id={name}
          portal={shouldPortal ? `#${PORTAL_ID}` : undefined}
          label="Drag the video file here"
          mimeTypes={"video/mp4"}
          canSelectFile={canSelectFile}
          onSelectFile={handleFileSelected}
          disabled={disabled}
        />
      )}

      {processingStatus === "queued" && (
        <Text size="sm">Qeued. Waiting for other uploads to finish...</Text>
      )}

      {currentQueue?.error && (
        <Alert
          title="Upload error"
          className="mb-4"
          color="error"
          icon={<ExclamationCircleIcon />}
          small
        >
          {currentQueue.error}
        </Alert>
      )}

      {processingStatus === "upload" && (
        <>
          {batchId && batchStatus === undefined ? (
            <FileUploadProgress progress={currentQueue?.completion ?? 0} />
          ) : (
            <Text size="sm">Waiting postage batch creation...</Text>
          )}
        </>
      )}

      {processingStatus === "encoding" && (
        <FileUploadProgress progress={currentQueue?.completion ?? 0} color="rainbow" />
      )}

      {processingStatus === "preview" && <VideoSourceStats source={currentSource} />}
    </Card>
  )
}

export default VideoSourceProcessing
