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

import React, { useState } from "react"
import { Redirect } from "react-router"

import "./video-editor.scss"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { ReactComponent as TrashIcon } from "@svg/icons/trash.svg"
import { ReactComponent as NotesIcon } from "@svg/icons/notes.svg"
import { ReactComponent as MovieIcon } from "@svg/icons/movie.svg"
import { ReactComponent as EyeIcon } from "@svg/icons/eye.svg"

import VideoDetails from "./VideoDetails"
import VideoSources from "./VideoSources"
import VideoExtra from "./VideoExtra"
import VideoDeleteModal from "./VideoDeleteModal"
import Button from "@common/Button"
import ProgressTab, { ProgressTabContent, ProgressTabLink } from "@common/ProgressTab"
import FieldDesrcription from "@common/FieldDesrcription"
import Divider from "@common/Divider"
import { useVideoEditorBaseActions, useVideoEditorState } from "@context/video-editor-context/hooks"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { useConfirmation, useErrorMessage } from "@state/hooks/ui"
import VideoEditorCache from "@context/video-editor-context/VideoEditorCache"

const PORTAL_ID = "video-drag-portal"

const VideoEditor = () => {
  const { waitConfirmation } = useConfirmation()
  const { address } = useSelector(state => state.user)
  const [{ reference, queue, videoHandler }] = useVideoEditorState()
  const hasQueuedProcesses = queue.filter(q => !q.reference).length > 0
  const hasOriginalVideo = videoHandler.originalQuality && videoHandler.sources.length > 0
  const canPublishVideo = videoHandler.video.title && hasOriginalVideo

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
    } catch (error: any) {
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
    } catch (error: any) {
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

  const askToClearState = async () => {
    const clear = await waitConfirmation(
      "Clear all",
      "Are you sure you want to clear the upload data? This action cannot be reversed.",
      "Yes, clear",
      "destructive"
    )
    clear && resetState()
  }

  const SaveButton = () => (
    <>
      {isSubmitting ? (
        <Spinner width={30} />
      ) : (
        <Button
          onClick={submitVideo}
          disabled={
            !canPublishVideo ||
            hasQueuedProcesses ||
            isDeleting
          }
          large
        >
          {reference ? "Update video" : "Publish video"}
        </Button>
      )}
    </>
  )

  const usePortal = VideoEditorCache.isCacheEmptyOrDefault && queue.length === 0 && !reference

  return (
    <>
      {usePortal && (
        <div id={PORTAL_ID}></div>
      )}
      <div className="video-editor" style={{ display: usePortal ? "none" : undefined }}>
        <div className="row">
          <div className="col">
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
                <VideoSources initialDragPortal={`#${PORTAL_ID}`} isSubmitting={isSubmitting} />
              </ProgressTabContent>
              <ProgressTabContent tabKey="extra">
                <VideoExtra isSubmitting={isSubmitting} />
              </ProgressTabContent>
            </ProgressTab>

            <Divider className="mt-10" bottom />

            <div className="video-editor-action-bar">
              <div className="video-editor-action-save">
                <SaveButton />
                {!canPublishVideo && (
                  <FieldDesrcription smaller>
                    Before publishing a video you must upload a <wbr />
                    <strong>video source</strong> and insert a <strong>title</strong>.
                  </FieldDesrcription>
                )}
              </div>

              {reference ? (
                <Button
                  modifier="danger"
                  disabled={isSubmitting}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Video
                </Button>
              ) : (
                <Button aspect="link" modifier="secondary" onClick={askToClearState}><TrashIcon /> Clear all</Button>
              )}
            </div>
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
