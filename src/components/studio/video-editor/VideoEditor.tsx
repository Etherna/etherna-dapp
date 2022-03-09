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

import React, { useEffect, useImperativeHandle, useState } from "react"
import { Navigate } from "react-router"

import { ReactComponent as NotesIcon } from "@assets/icons/notes.svg"
import { ReactComponent as MovieIcon } from "@assets/icons/movie.svg"
// import { ReactComponent as EyeIcon } from "@assets/icons/eye.svg"

import VideoDetails from "./VideoDetails"
import VideoSources from "./VideoSources"
// import VideoExtra from "./VideoExtra"
import ProgressTab from "@common/ProgressTab"
import ProgressTabContent from "@common/ProgressTabContent"
import ProgressTabLink from "@common/ProgressTabLink"
import WalletState from "@components/studio/other/WalletState"
import SwarmVideoIO from "@classes/SwarmVideo"
import { useVideoEditorBaseActions, useVideoEditorState } from "@context/video-editor-context/hooks"
import VideoEditorCache from "@context/video-editor-context/VideoEditorCache"
import routes from "@routes"
import useUserPlaylists from "@hooks/useUserPlaylists"
import useSelector from "@state/useSelector"
import { useWallet } from "@state/hooks/env"
import { useConfirmation, useErrorMessage } from "@state/hooks/ui"
import type { Profile } from "@definitions/swarm-profile"

const PORTAL_ID = "video-drag-portal"

export type VideoEditorHandle = {
  canSubmitVideo: boolean
  isEmpty: boolean
  submitVideo(): Promise<void>
  askToClearState(): Promise<void>
  resetState(): void
}

const VideoEditor = React.forwardRef<VideoEditorHandle, any>((_, ref) => {
  const { waitConfirmation } = useConfirmation()
  const profile = useSelector(state => state.profile)
  const indexClient = useSelector(state => state.env.indexClient)
  const { address, batches } = useSelector(state => state.user)

  const [{ reference, queue, videoWriter, hasChanges }] = useVideoEditorState()
  const hasQueuedProcesses = queue.filter(q => !q.reference).length > 0
  const hasOriginalVideo = videoWriter.originalQuality && videoWriter.sources.length > 0
  const canPublishVideo = !!videoWriter.videoRaw.title && hasOriginalVideo

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const { showError } = useErrorMessage()
  const { resetState } = useVideoEditorBaseActions()
  const { isLocked, selectedAddress } = useWallet()

  const {
    channelPlaylist,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist
  } = useUserPlaylists(address!, { resolveChannel: true })

  useEffect(() => {
    if (address) {
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useImperativeHandle(ref, () => ({
    isEmpty: queue.length === 0,
    canSubmitVideo: canPublishVideo && !hasQueuedProcesses,
    submitVideo,
    resetState,
    askToClearState,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }))

  const submitVideo = async () => {
    if (!batches || batches.length === 0) {
      return showError("Cannot upload", "You don't have any storage yet.")
    }

    if (isLocked) {
      return showError(
        "Wallet Locked",
        "Please unlock your wallet before saving."
      )
    }

    const { duration, originalQuality } = videoWriter.videoRaw

    if (!channelPlaylist) {
      return showError(
        "Channel error",
        "Channel video list not fetched correctly."
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
      const newReference = await videoWriter.update(ownerProfile)

      // update on index
      const indexed = await updateOrCreateIndexVideo(newReference)
      if (!indexed) {
        throw new Error(`Cannot ${reference ? "update" : "add"} video on the current Index`,)
      }

      // update channel playlist
      !reference && await addVideosToPlaylist(channelPlaylist.id, [videoWriter.video!])
      reference && await updateVideoInPlaylist(channelPlaylist.id, reference, videoWriter.video!)

      resetState()
      setIsSubmitting(false)
      setSaved(true)
    } catch (error: any) {
      console.error(error)
      showError("Publishing error", error.message)
      setIsSubmitting(false)
    }
  }

  const updateOrCreateIndexVideo = async (newReference: string) => {
    try {
      if (videoWriter.indexReference) {
        await indexClient.videos.updateVideo(videoWriter.indexReference, newReference)
      } else {
        await indexClient.videos.createVideo(newReference)
      }
      return true
    } catch (error) {
      return false
    }
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

  const usePortal = !reference && !hasChanges

  if (saved) {
    return <Navigate to={routes.studioVideos} />
  }

  return (
    <>
      <div className="my-6">
        <WalletState
          isLocked={isLocked}
          selectedAddress={selectedAddress}
          profileAddress={address!}
        />
      </div>

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
              {/* <ProgressTabLink
                tabKey="extra"
                title="Extra"
                iconSvg={<EyeIcon />}
                text="Audience, visibility, ..."
              /> */}

              <ProgressTabContent tabKey="details">
                <VideoDetails isSubmitting={isSubmitting} />
              </ProgressTabContent>
              <ProgressTabContent tabKey="sources">
                <VideoSources initialDragPortal={`#${PORTAL_ID}`} isSubmitting={isSubmitting} />
              </ProgressTabContent>
              {/* <ProgressTabContent tabKey="extra">
                <VideoExtra isSubmitting={isSubmitting} />
              </ProgressTabContent> */}
            </ProgressTab>
          </div>
        </div>
      </div>
    </>
  )
})

export default VideoEditor
