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

import React, { useImperativeHandle, useRef, useState } from "react"
import { Canceler } from "axios"

import FileUploadFlow, { FileUploadFlowHandlers } from "@components/media/FileUploadFlow"
import FileUploadProgress from "@components/media/FileUploadProgress"
import {
  useVideoEditorBaseActions,
  useVideoEditorQueueActions,
  useVideoEditorState
} from "@context/video-editor-context/hooks"
import { useErrorMessage } from "@state/hooks/ui"
import ImageSourcePreview from "@components/media/ImageSourcePreview"

type ThumbnailUploadProps = {
  disabled?: boolean
  onComplete?: () => void
  onCancel?: () => void
}

export type ThumbnailUploadHandlers = {
  clear: () => void
}

export const THUMBNAIL_QUEUE_NAME = "thumbnail"

const ThumbnailUpload = React.forwardRef<ThumbnailUploadHandlers, ThumbnailUploadProps>(({
  disabled,
  onComplete,
  onCancel
}, ref) => {
  const flowRef = useRef<FileUploadFlowHandlers>(null)
  const [{ queue, videoHandler }] = useVideoEditorState()
  const [canceler, setCanceler] = useState<Canceler>()
  const [contentType, setContentType] = useState<string>("image/*")

  const { addToQueue, removeFromQueue, updateQueueCompletion } = useVideoEditorQueueActions()
  const { resetState } = useVideoEditorBaseActions()
  const { showError } = useErrorMessage()

  const currentQueue = queue.find(q => !q.reference)
  const thumbnailQueue = queue.find(q => q.name === THUMBNAIL_QUEUE_NAME)
  const uploadProgress = thumbnailQueue?.completion

  useImperativeHandle(ref, () => ({
    clear() {
      flowRef.current?.clear()
      resetState()
    },
  }))

  const handleFileSelected = (file: File) => {
    setContentType(file.type)
    addToQueue(THUMBNAIL_QUEUE_NAME)
  }

  const uploadThumbnail = async (buffer: ArrayBuffer) => {
    const reference = await videoHandler.addThumbnail(buffer, contentType, {
      onCancelToken: c => setCanceler(c),
      onUploadProgress: p => updateQueueCompletion(THUMBNAIL_QUEUE_NAME, p),
    })
    updateQueueCompletion(THUMBNAIL_QUEUE_NAME, 100, reference)

    // Completion
    onComplete?.()

    return reference
  }

  const handleReset = async () => {
    removeFromQueue(THUMBNAIL_QUEUE_NAME)

    canceler?.("Upload canceled by the user")

    try {
      await videoHandler.removeThumbnail()
    } catch (error) {
      showError("Error", error.message)
    }

    onCancel?.()
  }

  return (
    <>
      <FileUploadFlow
        ref={flowRef}
        reference={thumbnailQueue?.reference}
        label={"Thumbnail"}
        dragLabel={"Drag your thumbnail here"}
        acceptTypes={["image"]}
        sizeLimit={2}
        canProcessFile={currentQueue?.name === THUMBNAIL_QUEUE_NAME}
        uploadHandler={uploadThumbnail}
        onFileSelected={handleFileSelected}
        onCancel={handleReset}
        disabled={disabled}
      >
        {({ isUploading }) => (
          isUploading ? (
            <FileUploadProgress progress={uploadProgress ?? 0} />
          ) : (
            <ImageSourcePreview image={videoHandler.thumbnail} />
          )
        )}
      </FileUploadFlow>
    </>
  )
})

export default ThumbnailUpload
