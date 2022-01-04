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

import React, { useEffect, useState } from "react"
import { Redirect } from "react-router"

import classes from "@styles/components/video-editor/VideoEditor.module.scss"
import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"
import { ReactComponent as TrashIcon } from "@assets/icons/trash.svg"
import { ReactComponent as NotesIcon } from "@assets/icons/notes.svg"
import { ReactComponent as MovieIcon } from "@assets/icons/movie.svg"
import { ReactComponent as EyeIcon } from "@assets/icons/eye.svg"

import VideoDetails from "./VideoDetails"
import VideoSources from "./VideoSources"
import VideoExtra from "./VideoExtra"
import VideoDeleteModal from "./VideoDeleteModal"
import Button from "@common/Button"
import ProgressTab from "@common/ProgressTab"
import ProgressTabContent from "@common/ProgressTabContent"
import ProgressTabLink from "@common/ProgressTabLink"
import FieldDesrcription from "@common/FieldDesrcription"
import Divider from "@common/Divider"
import SwarmImageIO from "@classes/SwarmImage"
import SwarmVideoIO from "@classes/SwarmVideo"
import { useVideoEditorBaseActions, useVideoEditorState } from "@context/video-editor-context/hooks"
import VideoEditorCache from "@context/video-editor-context/VideoEditorCache"
import Routes from "@routes"
import useUserPlaylists from "@hooks/useUserPlaylists"
import useSelector from "@state/useSelector"
import { useConfirmation, useErrorMessage } from "@state/hooks/ui"
import type { Profile } from "@definitions/swarm-profile"

const PORTAL_ID = "video-drag-portal"

const VideoEditor = () => {
  const { waitConfirmation } = useConfirmation()
  const profile = useSelector(state => state.profile)
  const { address } = useSelector(state => state.user)
  const { beeClient } = useSelector(state => state.env)

  const [{ reference, queue, videoWriter }] = useVideoEditorState()
  const hasQueuedProcesses = queue.filter(q => !q.reference).length > 0
  const hasOriginalVideo = videoWriter.originalQuality && videoWriter.sources.length > 0
  const canPublishVideo = videoWriter.videoRaw.title && hasOriginalVideo

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [videoLink, setVideoLink] = useState<string>()

  const { showError } = useErrorMessage()
  const { resetState } = useVideoEditorBaseActions()
  const {
    channelPlaylist,
    loadPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist
  } = useUserPlaylists(address!, { resolveChannel: true })

  useEffect(() => {
    if (address) {
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const submitVideo = async () => {
    const { duration, originalQuality } = videoWriter.videoRaw

    if (!channelPlaylist) {
      return showError(
        "Channel error",
        "Channel video list not fetched."
      )
    }

    if (!duration || !originalQuality) {
      return showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to re-upload the original video."
      )
    }

    setIsSubmitting(true)

    try {
      const ownerProfile: Profile = {
        address: address!,
        name: profile.name ?? null,
        description: profile.description ?? null,
        avatar: profile.avatar ?? null,
        cover: profile.cover ?? null,
        birthday: profile.birthday,
        location: profile.location,
        website: profile.website,
      }
      const videoReference = await videoWriter.update(ownerProfile)

      // update channel playlist
      !reference && await addVideoToPlaylist(channelPlaylist.id, videoReference)

      // update route state for redirect
      window.routeState = videoWriter.video

      resetState()
      setVideoLink(Routes.getVideoLink(videoReference))
      setSaved(true)
    } catch (error: any) {
      console.error(error)
      showError("Linking error", error.message)
    }

    setIsSubmitting(false)
  }

  const deleteVideo = async () => {
    if (!channelPlaylist) {
      return showError(
        "Channel error",
        "Channel video list not fetched."
      )
    }

    setIsDeleting(true)

    try {
      await videoWriter.deleteVideo()
      await removeVideoFromPlaylist(channelPlaylist.id, reference!)

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
      <div style={{ display: usePortal ? "none" : undefined }}>
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
                progressList={queue.filter(q => SwarmVideoIO.getSourceQuality(q.name) > 0).map(q => ({
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

            <div className={classes.videoEditorActionBar}>
              <div className={classes.videoEditorActionSave}>
                <SaveButton />
                {(!canPublishVideo && !reference) && (
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
          imagePreview={
            videoWriter.thumbnail
              ? beeClient.getBzzUrl(SwarmImageIO.Reader.getOriginalSourceReference(videoWriter.thumbnail)!)
              : undefined
          }
          title={videoWriter.title ?? "Undefined"}
          deleteHandler={deleteVideo}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

export default VideoEditor
