import React, { useState } from "react"
import { Redirect } from "react-router"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { ReactComponent as TrashIcon } from "@svg/icons/trash.svg"

import { useVideoEditorState } from "./context"
import VideoCompletion from "./VideoCompletion"
import VideoProperties from "./VideoProperties"
import VideoDeleteModal from "./VideoDeleteModal"
import Button from "@common/Button"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"

const VideoEditor = () => {
  const { address } = useSelector(state => state.user)
  const { state, actions } = useVideoEditorState()
  const { reference, queue, videoHandler } = state
  const { resetState } = actions
  const hasQueuedProcesses = queue.filter(q => !q.reference).length > 0
  const hasOriginalVideo = videoHandler.originalQuality && videoHandler.sources.length > 0

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [videoLink, setVideoLink] = useState<string>()

  const submitVideo = async () => {
    const { duration, originalQuality } = videoHandler.video

    if (!duration || !originalQuality) {
      showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to re-upload the original video."
      )
      return
    }

    setIsSubmitting(true)

    try {
      const reference = await videoHandler.updateVideo()

      // update route state for redirect
      window.routeState = videoHandler.video

      resetState()
      setVideoLink(Routes.getVideoLink(reference))
      setSaved(true)
    } catch (error) {
      console.error(error)
      showError("Linking error", error.message)
    }

    setIsSubmitting(false)
  }

  const deleteVideo = async () => {
    setIsDeleting(true)

    try {
      await videoHandler.deleteVideo()

      setSaved(true)
    } catch (error) {
      showError("Cannot delete the video", error.message)
    }

    setIsDeleting(false)
  }

  if (saved) {
    return videoLink ? (
      <Redirect to={videoLink!} />
    ) : (
      <Redirect to={Routes.getProfileLink(address!)} />
    )
  }

  const SaveButton = () => (
    <>
      {isSubmitting ? (
        <Spinner width={30} />
      ) : (
        <Button
          action={submitVideo}
          disabled={
            !videoHandler.title ||
            hasQueuedProcesses ||
            !hasOriginalVideo ||
            isDeleting
          }
        >
          {reference ? "Update video" : "Add video"}
        </Button>
      )}

      {!videoHandler.video.isVideoOnIndex && (
        <div className="mt-5">
          <Button aspect="link-secondary" action={resetState}><TrashIcon /> Clear all</Button>
        </div>
      )}
    </>
  )

  const DeleteButton = () => (
    <Button
      aspect="danger"
      disabled={isSubmitting}
      action={() => setShowDeleteModal(true)}
    >
      Delete Video
    </Button>
  )

  return (
    <>
      <div className="video-editor">
        <div className="row">
          <div className="col sm:w-1/2 lg:w-2/3">
            <VideoProperties isSubmitting={isSubmitting} />
            {reference && (
              <div className="flex items-center justify-between">
                <SaveButton />
                <DeleteButton />
              </div>
            )}
          </div>
          <div className="col step-col sm:w-1/2 lg:w-1/3">
            {!reference && (
              <>
                <VideoCompletion />
                <SaveButton />
              </>
            )}
          </div>
        </div>
      </div>
      {reference && (
        <VideoDeleteModal
          show={showDeleteModal}
          imagePreview={videoHandler.thumbnail?.originalSource}
          title={videoHandler.title ?? "Undefined"}
          deleteHandler={deleteVideo}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

export default VideoEditor
