import React, { useImperativeHandle, useRef } from "react"

import FileUploadFlow from "../FileUploadFlow"
import { useUploaderState } from "../UploaderContext"
import { showError } from "@state/actions/modals"
import { deleteThumbnail } from "@utils/video"

const ThumbnailUpload = ({ hash, pinContent, disabled, onComplete, onCancel }, ref) => {
  const flowRef = useRef()
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
      flowRef.current.clear()
      resetState()
    }
  }))

  const handleHashUpdate = hash => {
    if (hash) {
      updateManifest(hash)
      updateCompletion(`thumbnail`, 100, true)

      onComplete && onComplete()
    }
  }

  const handleProgress = progress => {
    updateCompletion(`thumbnail`, progress)
  }

  const handleReset = async () => {
    removeFromQueue(`thumbnail`)

    try {
      const hash = await deleteThumbnail(manifest)
      updateManifest(hash)
    } catch (error) {
      showError("Error", error.message)
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
}

export default React.forwardRef(ThumbnailUpload)
