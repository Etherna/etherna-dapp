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

import React, { useCallback, useImperativeHandle, useRef, useState } from "react"
import type { Canceler } from "axios"

import type { FileUploadFlowHandlers } from "@/components/media/FileUploadFlow"
import FileUploadFlow from "@/components/media/FileUploadFlow"
import FileUploadProgress from "@/components/media/FileUploadProgress"
import ImageSourcePreview from "@/components/media/ImageSourcePreview"
import { Button } from "@/components/ui/actions"
import {
  useVideoEditorBaseActions,
  useVideoEditorQueueActions,
  useVideoEditorState,
} from "@/context/video-editor-context/hooks"
import { useErrorMessage } from "@/state/hooks/ui"
import { isAnimatedImage } from "@/utils/media"
import { isMimeWebCompatible } from "@/utils/mime-types"

type ThumbnailUploadProps = {
  disabled?: boolean
  onComplete?: () => void
  onCancel?: () => void
}

export type ThumbnailUploadHandlers = {
  clear: () => void
}

export const THUMBNAIL_QUEUE_NAME = "thumbnail"

const ThumbnailUpload = React.forwardRef<ThumbnailUploadHandlers, ThumbnailUploadProps>(
  ({ disabled, onComplete, onCancel }, ref) => {
    const flowRef = useRef<FileUploadFlowHandlers>(null)
    const [{ queue, videoWriter }] = useVideoEditorState()
    const [contentType, setContentType] = useState<string>("image/*")
    const canceler = useRef<Canceler>()

    const { addToQueue, removeFromQueue, updateQueueCompletion, setQueueError } =
      useVideoEditorQueueActions()
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

    const handleFileSelected = useCallback(
      (file: File) => {
        setContentType(file.type)
        addToQueue(THUMBNAIL_QUEUE_NAME)
      },
      [addToQueue]
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

    const uploadThumbnail = useCallback(
      async (buffer: ArrayBuffer) => {
        if (isAnimatedImage(new Uint8Array(buffer))) {
          throw new Error("Animated images are not allowed")
        }

        // show loading start while processing responsive images
        updateQueueCompletion(THUMBNAIL_QUEUE_NAME, 1)

        const reference = await videoWriter.addThumbnail(buffer, contentType, {
          onCancelToken: c => {
            canceler.current = c
          },
          onUploadProgress: p => {
            updateQueueCompletion(THUMBNAIL_QUEUE_NAME, p)
          },
        })

        updateQueueCompletion(THUMBNAIL_QUEUE_NAME, 100, reference)

        // Completion
        onComplete?.()

        return reference
      },
      [contentType, onComplete, updateQueueCompletion, videoWriter]
    )

    const handleReset = useCallback(async () => {
      removeFromQueue(THUMBNAIL_QUEUE_NAME)

      canceler.current?.("Upload canceled by the user")

      videoWriter.removeThumbnail()

      onCancel?.()
    }, [onCancel, removeFromQueue, videoWriter])

    const handleUploadError = useCallback(
      (errorMessage: string) => {
        setQueueError(THUMBNAIL_QUEUE_NAME, errorMessage)
      },
      [setQueueError]
    )

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
          canSelectFile={canSelectFile}
          onCancel={handleReset}
          onUploadError={handleUploadError}
          disabled={disabled}
        >
          {({ isUploading }) =>
            isUploading || !videoWriter.thumbnail ? (
              <FileUploadProgress progress={uploadProgress ?? 0} />
            ) : (
              <>
                <ImageSourcePreview image={videoWriter.thumbnail} />
                <Button
                  className="mt-4 text-sm"
                  aspect="text"
                  color="inverted"
                  onClick={handleReset}
                  small
                >
                  Change thumbnail
                </Button>
              </>
            )
          }
        </FileUploadFlow>
      </>
    )
  }
)

export default ThumbnailUpload
