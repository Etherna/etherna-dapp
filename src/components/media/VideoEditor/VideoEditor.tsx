import { useState } from "react"
import { Redirect } from "react-router"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

import { useVideoEditorState } from "./VideoEditorContext"
import VideoCompletion from "./VideoCompletion"
import VideoProperties from "./VideoProperties"
import VideoDeleteModal from "./VideoDeleteModal"
import Button from "@common/Button"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"

const VideoEditor = () => {
  const { address } = useSelector(state => state.user)
  const { state } = useVideoEditorState()
  const { reference, manifest, queue, videoHandler } = state
  const hasQueuedProcesses = queue.filter(q => q.finished === false).length > 0
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
      const manifest = await videoHandler.updateVideo()

      setVideoLink(Routes.getVideoLink(manifest))
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
    return reference ? (
      <Redirect to={Routes.getProfileLink(address!)} />
    ) : (
      <Redirect to={videoLink!} />
    )
  }

  const SaveButton = () => (
    <>
      {isSubmitting ? (
        <Spinner width={30} />
      ) : (
        <Button
          action={submitVideo}
          disabled={manifest == null || !videoHandler.title || hasQueuedProcesses || !hasOriginalVideo || isDeleting}
        >
          {reference ? "Update video" : "Add video"}
        </Button>
      )}
    </>
  )

  const DeleteButton = () => (
    <Button aspect="danger" disabled={isSubmitting} action={() => setShowDeleteModal(true)}>
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
              <>
                <SaveButton />
                <DeleteButton />
              </>
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
