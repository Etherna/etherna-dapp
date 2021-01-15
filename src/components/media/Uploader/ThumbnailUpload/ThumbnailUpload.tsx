import React, { useImperativeHandle, useRef } from "react"

import FileUploadFlow, { FileUploadHandlers } from "../FileUploadFlow"
import { useUploaderState } from "../UploaderContext"
import { showError } from "@state/actions/modals"
import { deleteThumbnail } from "@utils/video"

type ThumbnailUploadProps = {
  hash?: string
  pinContent?: boolean
  disabled?: boolean
  onComplete?: () => void
  onCancel?: () => void
}

export type ThumbnailUploadHandlers = {
  clear: () => void
}

const ThumbnailUpload = React.forwardRef<ThumbnailUploadHandlers, ThumbnailUploadProps>(({
  hash,
  pinContent,
  disabled,
  onComplete,
  onCancel
}, ref) => {
  const flowRef = useRef<FileUploadHandlers>(null)
  const { state, actions } = useUploaderState()
  const { manifest } = state
  const {
    updateManifest,
    addToQueue,
    removeFromQueue,
    updateCompletion,
    resetState,
  } = actions
  const currentQueue = state.queue.find(q => !q.finished)

  useImperativeHandle(ref, () => ({
    clear() {
      flowRef.current?.clear()
      resetState()
    }
  }))

  const handleHashUpdate = (hash: string|undefined) => {
    if (hash) {
      updateManifest(hash)
      updateCompletion(`thumbnail`, 100, true)

      onComplete && onComplete()
    }
  }

  const handleProgress = (progress: number|undefined) => {
    updateCompletion(`thumbnail`, progress || 0)
  }

  const handleReset = async () => {
    removeFromQueue(`thumbnail`)

    if (manifest) {
      try {
        const hash = await deleteThumbnail(manifest)
        updateManifest(hash)
      } catch (error) {
        showError("Error", error.message)
      }
    }

    onCancel && onCancel()
  }

  return (
    <FileUploadFlow
      ref={flowRef}
      hash={hash}
      label={"Thumbnail"}
      dragLabel={"Drag your thumbnail here"}
      acceptTypes={["image"]}
      sizeLimit={2}
      showImagePreview={true}
      pinContent={pinContent}
      manifest={manifest}
      path={`thumbnail`}
      canProcessFile={currentQueue && currentQueue.name === `thumbnail`}
      onConfirmedProcessing={() => addToQueue(`thumbnail`)}
      onHashUpdate={handleHashUpdate}
      onProgressChange={handleProgress}
      onCancel={handleReset}
      disabled={disabled}
    />
  )
})

export default ThumbnailUpload
