import React, { useState } from "react"
import { Redirect } from "react-router"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { ReactComponent as TrashIcon } from "@svg/icons/trash.svg"
import { ReactComponent as NotesIcon } from "@svg/icons/notes.svg"
import { ReactComponent as MovieIcon } from "@svg/icons/movie.svg"
import { ReactComponent as EyeIcon } from "@svg/icons/eye.svg"

import VideoDetails from "./VideoDetails"
import VideoSources from "./VideoSources"
import VideoExtra from "./VideoExtra"
import VideoCompletion from "./VideoCompletion"
import VideoDeleteModal from "./VideoDeleteModal"
import Button from "@common/Button"
import { useVideoEditorBaseActions, useVideoEditorState } from "@context/video-editor-context/hooks"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { useErrorMessage } from "@state/hooks/ui"
import ProgressTab, { ProgressTabContent, ProgressTabLink } from "@common/ProgressTab"

const VideoEditor = () => {
  const { address } = useSelector(state => state.user)
  const [{ reference, queue, videoHandler }] = useVideoEditorState()
  const hasQueuedProcesses = queue.filter(q => !q.reference).length > 0
  const hasOriginalVideo = videoHandler.originalQuality && videoHandler.sources.length > 0

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [videoLink, setVideoLink] = useState<string>()

  const { showError } = useErrorMessage()
  const { resetState } = useVideoEditorBaseActions()

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
          {reference ? "Update video" : "Publish video"}
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
          <div className="col lg:w-2/3 xl:w-3/4">
            <ProgressTab defaultKey="details">
              <ProgressTabLink
                tabKey="details"
                title="Details"
                iconSvg={<NotesIcon />}
                text="Title, description, ..."
              />
              <ProgressTabLink
                tabKey="sources"
                title="Sources"
                iconSvg={<MovieIcon />}
                progressList={queue.map(q => ({
                  progress: q.completion ? q.completion / 100 : null,
                  completed: !!q.reference
                }))}
              />
              <ProgressTabLink
                tabKey="extra"
                title="Extra"
                iconSvg={<EyeIcon />}
                text="Audience, visibility, ..."
              />

              <ProgressTabContent tabKey="details">
                <VideoDetails isSubmitting={isSubmitting} />
              </ProgressTabContent>
              <ProgressTabContent tabKey="sources">
                <VideoSources isSubmitting={isSubmitting} />
              </ProgressTabContent>
              <ProgressTabContent tabKey="extra">
                <VideoExtra isSubmitting={isSubmitting} />
              </ProgressTabContent>
            </ProgressTab>

            {reference && (
              <div className="flex items-center justify-between">
                <SaveButton />
                <DeleteButton />
              </div>
            )}
          </div>
          <div className="col step-col lg:w-1/3 xl:w-1/4">
            {!reference && (
              <>
                <VideoCompletion />
                <div className="mt-8">
                  <SaveButton />
                </div>
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
