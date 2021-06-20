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

import { useVideoEditorState } from "../context"
import FileUploadFlow, { FileUploadFlowHandlers } from "@components/media/FileUploadFlow"
import FileUploadProgress from "@components/media/FileUploadProgress"
import { showError } from "@state/actions/modals"

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
  const [canceler, setCanceler] = useState<Canceler>()
  const [contentType, setContentType] = useState<string>("image/*")

  const { state, actions } = useVideoEditorState()
  const { queue, videoHandler } = state
  const { addToQueue, removeFromQueue, updateCompletion, resetState } = actions

  const currentQueue = queue.find(q => !q.reference)
  const thumbnailQueue = queue.find(q => q.name === THUMBNAIL_QUEUE_NAME)
  const uploadProgress = thumbnailQueue?.completion

  useImperativeHandle(ref, () => ({
    clear() {
      flowRef.current?.clear()
      resetState()
    },
  }))

  const uploadThumbnail = async (buffer: ArrayBuffer) => {
    const reference = await videoHandler.addThumbnail(buffer, contentType, {
      onCancelToken: c => setCanceler(c),
      onUploadProgress: p => updateCompletion(THUMBNAIL_QUEUE_NAME, p),
    })
    updateCompletion(THUMBNAIL_QUEUE_NAME, 100, reference)

    onComplete?.()

    return reference
  }

  const handleReset = async () => {
    removeFromQueue(THUMBNAIL_QUEUE_NAME)

    try {
      await videoHandler.removeThumbnail()
    } catch (error) {
      showError("Error", error.message)
    }

    onCancel?.()
  }

  return (
    <>
      {uploadProgress && !thumbnailQueue?.reference && (
        <FileUploadProgress
          progress={uploadProgress}
          canceler={canceler}
          disabled={disabled}
          onCancelUpload={handleReset}
        />
      )}
      <FileUploadFlow
        ref={flowRef}
        reference={thumbnailQueue?.reference}
        label={"Thumbnail"}
        dragLabel={"Drag your thumbnail here"}
        acceptTypes={["image"]}
        sizeLimit={2}
        canProcessFile={currentQueue?.name === THUMBNAIL_QUEUE_NAME}
        uploadHandler={uploadThumbnail}
        onFileSelected={file => setContentType(file.type)}
        onConfirmedProcessing={() => addToQueue(THUMBNAIL_QUEUE_NAME)}
        onCancel={handleReset}
        disabled={disabled}
      />
    </>
  )
})

export default ThumbnailUpload
