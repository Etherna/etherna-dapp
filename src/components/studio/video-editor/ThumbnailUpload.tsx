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
import React, { useCallback, useMemo, useRef, useState } from "react"
import { bytesReferenceToReference, getNodesWithPrefix } from "@etherna/api-js/utils"

import { MinusIcon } from "@heroicons/react/24/outline"

import SwarmImage from "@/classes/SwarmImage"
import FileDrag from "@/components/media/FileDrag"
import FileUploadProgress from "@/components/media/FileUploadProgress"
import ImageSourcePreview from "@/components/media/ImageSourcePreview"
import { Button } from "@/components/ui/actions"
import { Card, Text } from "@/components/ui/display"
import useConfirmation from "@/hooks/useConfirmation"
import useErrorMessage from "@/hooks/useErrorMessage"
import useVideoEditorQueue from "@/hooks/useVideoEditorQueue"
import useClientsStore from "@/stores/clients"
import useVideoEditorStore from "@/stores/video-editor"
import { isAnimatedImage } from "@/utils/media"
import { isMimeWebCompatible } from "@/utils/mime-types"

import type { Image } from "@etherna/api-js"
import type { BatchId } from "@etherna/api-js/clients"

type ThumbnailUploadProps = {
  disabled?: boolean
}

export const THUMBNAIL_QUEUE_NAME = "thumbnail"

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({ disabled }) => {
  const beeClient = useClientsStore(state => state.beeClient)
  const batchStatus = useVideoEditorStore(state => state.batchStatus)
  const pinContent = useVideoEditorStore(state => state.pinContent)
  const thumbnail = useVideoEditorStore(state => state.builder.previewMeta.thumbnail)
  const batchId = useVideoEditorStore(state => state.builder.detailsMeta.batchId)
  const node = useVideoEditorStore(state => state.builder.node)
  const [selectedFile, setSelectedFile] = useState<File>()
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const abortController = useRef<AbortController>()

  const addToQueue = useVideoEditorStore(state => state.addToQueue)
  const removeFromQueue = useVideoEditorStore(state => state.removeFromQueue)
  const updateQueueCompletion = useVideoEditorStore(state => state.updateQueueCompletion)
  const updateQueueSize = useVideoEditorStore(state => state.updateQueueSize)
  const setQueueError = useVideoEditorStore(state => state.setQueueError)
  const setThumbnail = useVideoEditorStore(state => state.setThumbnail)
  const getThumbEntry = useVideoEditorStore(state => state.getThumbEntry)
  const { showError } = useErrorMessage()
  const { waitConfirmation } = useConfirmation()

  const uploadThumbnail = useCallback(
    async (queueId: string, progressCallback: (p: number) => void) => {
      if (!selectedFile) {
        return setQueueError(queueId, "Can't upload. No file selected.")
      }
      if (isAnimatedImage(new Uint8Array(await selectedFile.arrayBuffer()))) {
        return showError("Animated images are not allowed")
      }

      abortController.current = new AbortController()

      const imageWriter = new SwarmImage.Writer(selectedFile, {
        batchId: batchId as BatchId,
        beeClient,
        responsiveSizes: SwarmImage.Writer.thumbnailResponsiveSizes,
      })

      setIsProcessingImages(true)
      const processedImage = await imageWriter.pregenerateImages()
      setIsProcessingImages(false)

      const totalSize = processedImage.responsiveSourcesData.reduce(
        (acc, { data }) => acc + data.length,
        0
      )
      updateQueueSize(queueId, totalSize)

      try {
        let totalCompletion = 0
        await Promise.all(
          processedImage.responsiveSourcesData.map(({ data }) => {
            beeClient.bytes.upload(data, {
              batchId: batchId as BatchId,
              pin: pinContent,
              signal: abortController.current?.signal,
              onUploadProgress(completion) {
                totalCompletion += completion
                progressCallback(totalCompletion / totalSize)
              },
            })
          })
        )

        // remove data
        setSelectedFile(undefined)

        // will also be removed from queue
        setThumbnail(processedImage)
      } catch (error) {
        setQueueError(queueId, "There was a problem uploading the thumbnail")
      }
    },
    [
      batchId,
      beeClient,
      selectedFile,
      pinContent,
      setQueueError,
      setThumbnail,
      showError,
      updateQueueSize,
    ]
  )

  const processingOptions = useMemo(() => {
    return {
      hasSelectedFile: !!selectedFile,
      onUpload: uploadThumbnail,
    }
  }, [selectedFile, uploadThumbnail])

  const { processingStatus, currentQueue } = useVideoEditorQueue<Image>(
    THUMBNAIL_QUEUE_NAME,
    processingOptions
  )

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

      return true
    },
    [showError]
  )

  const handleFileSelected = useCallback(
    (file: File) => {
      setSelectedFile(file)
      addToQueue("upload", "thumbnail", THUMBNAIL_QUEUE_NAME)
    },
    [addToQueue]
  )

  const handleCancelUpload = useCallback(() => {
    abortController.current?.abort("User canceled the upload.")
    currentQueue && updateQueueCompletion(currentQueue.id, 0)
  }, [currentQueue, updateQueueCompletion])

  const handleRemove = useCallback(async () => {
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
      setThumbnail(null)
      setSelectedFile(undefined)
    }
  }, [currentQueue?.id, handleCancelUpload, removeFromQueue, setThumbnail, waitConfirmation])

  const waitingForBatch = useMemo(() => {
    return !batchId || batchStatus !== undefined
  }, [batchId, batchStatus])

  return (
    <Card
      title="Thumbnail"
      variant="fill"
      actions={
        <>
          {processingStatus !== "select" && (
            <Button
              color="warning"
              aspect="outline"
              prefix={<MinusIcon width={18} strokeWidth={2.5} />}
              rounded
              small
              onClick={handleRemove}
            >
              {processingStatus === "preview" ? "Remove" : "Cancel"}
            </Button>
          )}
        </>
      }
    >
      {processingStatus === "select" && !selectedFile && (
        <FileDrag
          id={THUMBNAIL_QUEUE_NAME}
          label={
            <p className="text-center">
              <span>Drag the thumbnail here</span>
              <br />
              <span className="text-sm">(ideal 16:9 format of 1280x720)</span>
            </p>
          }
          mimeTypes={"image/png,image/jpeg"}
          uploadLimit={1}
          canSelectFile={canSelectFile}
          onSelectFile={handleFileSelected}
          disabled={disabled}
        />
      )}

      {processingStatus === "queued" && (
        <Text size="sm">Qeued. Waiting for other uploads to finish...</Text>
      )}

      {processingStatus === "upload" && (
        <>
          {waitingForBatch ? (
            <Text size="sm">Waiting postage batch creation...</Text>
          ) : (
            <FileUploadProgress
              isPreloading={isProcessingImages}
              progress={currentQueue?.completion ?? 0}
              preloadingText={"Processing images..."}
            />
          )}
        </>
      )}

      {processingStatus === "encoding" && (
        <FileUploadProgress progress={currentQueue?.completion ?? 0} color="rainbow" />
      )}

      {processingStatus === "preview" && (
        <img className="w-full" src={beeClient.bytes.url(getThumbEntry()!)} />
      )}
    </Card>
  )
}

export default ThumbnailUpload
