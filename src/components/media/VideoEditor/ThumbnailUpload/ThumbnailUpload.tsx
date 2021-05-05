import React, { useImperativeHandle, useRef, useState } from "react"
import { Canceler } from "axios"

import { useVideoEditorState } from "../VideoEditorContext"
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

const ThumbnailUpload = React.forwardRef<ThumbnailUploadHandlers, ThumbnailUploadProps>(
  ({ disabled, onComplete, onCancel }, ref) => {
    const flowRef = useRef<FileUploadFlowHandlers>(null)
    const [canceler, setCanceler] = useState<Canceler>()
    const { state, actions } = useVideoEditorState()
    const { manifest, queue, videoHandler } = state
    const { updateManifest, addToQueue, removeFromQueue, updateCompletion, resetState } = actions
    const currentQueue = queue.find(q => !q.finished)
    const thumbnailQueue = queue.find(q => q.name === `thumbnail`)
    const uploadProgress = thumbnailQueue?.completion

    useImperativeHandle(ref, () => ({
      clear() {
        flowRef.current?.clear()
        resetState()
      },
    }))

    const uploadThumbnail = async (buffer: ArrayBuffer) => {
      const newManifest = await videoHandler.addThumbnail(buffer, {
        onCancelToken: c => setCanceler(c),
        onUploadProgress: p => updateCompletion(`thumbnail`, p),
      })
      updateManifest(newManifest)
      updateCompletion(`thumbnail`, 100, true)

      onComplete?.()

      return newManifest
    }

    const handleReset = async () => {
      removeFromQueue(`thumbnail`)

      if (manifest) {
        try {
          const newManifest = await videoHandler.removeThumbnail()
          updateManifest(newManifest)
        } catch (error) {
          showError("Error", error.message)
        }
      }

      onCancel?.()
    }

    return (
      <>
        {uploadProgress && !thumbnailQueue?.finished && (
          <FileUploadProgress
            progress={uploadProgress}
            canceler={canceler}
            disabled={disabled}
            onCancelUpload={handleReset}
          />
        )}
        <FileUploadFlow
          ref={flowRef}
          label={"Thumbnail"}
          dragLabel={"Drag your thumbnail here"}
          acceptTypes={["image"]}
          sizeLimit={2}
          canProcessFile={currentQueue && currentQueue.name === `thumbnail`}
          uploadHandler={uploadThumbnail}
          onConfirmedProcessing={() => addToQueue(`thumbnail`)}
          onCancel={handleReset}
          disabled={disabled}
        />
      </>
    )
  }
)

export default ThumbnailUpload
