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
import type { BatchId } from "@ethersphere/bee-js"

import { EyeIcon, FilmIcon } from "@heroicons/react/solid"
import { ClipboardListIcon } from "@heroicons/react/outline"

import VideoDetails from "./VideoDetails"
import VideoSources from "./VideoSources"
import VideoExtra from "./VideoExtra"
import Alert from "@/components/common/Alert"
import BatchLoading from "@/components/common/BatchLoading"
import Button from "@/components/common/Button"
import ProgressTab from "@/components/common/ProgressTab"
import ProgressTabContent from "@/components/common/ProgressTabContent"
import ProgressTabLink from "@/components/common/ProgressTabLink"
import WalletState from "@/components/studio/other/WalletState"
import SwarmVideoIO from "@/classes/SwarmVideo"
import {
  useVideoEditorBaseActions,
  useVideoEditorSaveActions,
  useVideoEditorState
} from "@/context/video-editor-context/hooks"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { useWallet } from "@/state/hooks/env"
import { useConfirmation, useErrorMessage } from "@/state/hooks/ui"

const PORTAL_ID = "video-drag-portal"

export type VideoEditorHandle = {
  canSubmitVideo: boolean
  isEmpty: boolean
  submitVideo(): Promise<void>
  saveVideoToChannel(): Promise<void>
  saveVideoToIndex(): Promise<void>
  askToClearState(): Promise<void>
  resetState(): void
}

const VideoEditor = React.forwardRef<VideoEditorHandle, any>((_, ref) => {
  const { address, defaultBatchId } = useSelector(state => state.user)
  const [{ reference, queue, videoWriter, hasChanges, saveTo, offerResources }] = useVideoEditorState()
  const [privateLink, setPrivateLink] = useState<string>()
  const [batchStatus, setBatchStatus] = useState<"creating" | "fetching" | "updating" | undefined>()

  const {
    reference: newReference,
    isSaving,
    addedToChannel,
    addedToIndex,
    resourcesOffered,
    saveVideo,
    saveVideoToChannel,
    saveVideoToIndex,
    saveVideoResources,
    resetState: resetSaveState,
  } = useVideoEditorSaveActions()

  const { isLocked, selectedAddress } = useWallet()
  const { resetState } = useVideoEditorBaseActions()
  const { waitConfirmation } = useConfirmation()
  const { showError } = useErrorMessage()
  const hasQueuedProcesses = queue.filter(q => !q.reference).length > 0
  const hasOriginalVideo = videoWriter.originalQuality && videoWriter.sources.length > 0
  const canPublishVideo = !!videoWriter.videoRaw.title && hasOriginalVideo
  const saveRedirect = newReference && saveTo !== "none" && (
    (saveTo === "channel" && addedToChannel) ||
    (saveTo === "channel-index" && addedToChannel && addedToIndex)
  )

  useImperativeHandle(ref, () => ({
    isEmpty: queue.length === 0,
    canSubmitVideo: canPublishVideo && !hasQueuedProcesses,
    submitVideo: async () => {
      await saveVideo(offerResources)
    },
    saveVideoToChannel,
    saveVideoToIndex,
    resetState: resetAll,
    askToClearState,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [canPublishVideo, hasQueuedProcesses, offerResources, queue, saveVideo, saveVideoToChannel, saveVideoToIndex])

  useEffect(() => {
    if (newReference && saveTo === "none") setPrivateLink(location.origin + routes.watch(newReference))
    if (newReference) resetAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newReference])

  useEffect(() => {
    setBatchStatus(undefined)

    if (reference && !videoWriter.videoRaw.batchId) {
      // assume we are editing an old video
      if (!defaultBatchId) {
        return showError("Cannot find postage batch for this video", "You might have to re-upload the video sources")
      }
      videoWriter.videoRaw.batchId = defaultBatchId as BatchId
    }

    videoWriter.onBatchCreating = () => setBatchStatus("creating")
    videoWriter.onBatchCreated = () => setBatchStatus(undefined)
    videoWriter.onBatchesLoading = () => setBatchStatus("fetching")
    videoWriter.onBatchesLoaded = () => setBatchStatus(undefined)
    videoWriter.onBatchUpdating = () => setBatchStatus("updating")
    videoWriter.onBatchUpdated = () => setBatchStatus(undefined)
    videoWriter.loadBatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoWriter])

  const resetAll = () => {
    resetState()
    resetSaveState()
  }

  const askToClearState = async () => {
    const clear = await waitConfirmation(
      "Clear all",
      "Are you sure you want to clear the upload data? This action cannot be reversed.",
      "Yes, clear",
      "destructive"
    )
    clear && resetAll()
  }

  if (saveRedirect) {
    return <Navigate to={routes.studioVideos} />
  }

  const usePortal = !reference && !hasChanges

  return (
    <>
      <div className="my-6 space-y-4">
        <WalletState
          isLocked={isLocked}
          selectedAddress={selectedAddress}
          profileAddress={address!}
        />

        {batchStatus && (
          <BatchLoading
            type={batchStatus}
            title={
              batchStatus === "creating"
                ? "Creating a postage batch for your video"
                : "Loading your video postage batches"
            }
            message={
              `Please wait while we ${batchStatus === "creating" ? "create" : "load"} your postage batch.` + `\n` +
              `Postage bastches are used to distribute your video to the network.`
            }
          />
        )}

        {addedToChannel === false && (
          <Alert title="Video not added to channel" type="warning">
            Try again! <br />
            <Button loading={isSaving} onClick={saveVideoToChannel}>Add to channel</Button>
          </Alert>
        )}

        {(addedToIndex === false && newReference) && (
          <Alert title="Video not added to index" type="warning">
            Try again! <br />
            <Button loading={isSaving} onClick={saveVideoToIndex}>Add to index</Button>
          </Alert>
        )}

        {(resourcesOffered === false && newReference) && (
          <Alert title="Video resources not offered" type="warning">
            Try again! <br />
            <Button loading={isSaving} onClick={saveVideoResources}>Offer resources</Button>
          </Alert>
        )}

        {privateLink && (
          <Alert title="Video saved" type="info" onClose={() => setPrivateLink(undefined)}>
            Your private video is ready to be shared. <br />
            { /* eslint-disable-next-line react/no-unescaped-entities */}
            Remeber that if you lose this link you won't be able to retrieve it again: <br />
            <a href={privateLink} target="_blank" rel="noreferrer">
              {privateLink}
            </a>
          </Alert>
        )}
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
                iconSvg={<ClipboardListIcon />}
                text="Title, description, ..."
              />
              <ProgressTabLink
                tabKey="sources"
                title="Sources"
                iconSvg={<FilmIcon />}
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
                <VideoDetails isSubmitting={isSaving} />
              </ProgressTabContent>
              <ProgressTabContent tabKey="sources">
                <VideoSources initialDragPortal={`#${PORTAL_ID}`} isSubmitting={isSaving} />
              </ProgressTabContent>
              <ProgressTabContent tabKey="extra">
                <VideoExtra isSubmitting={isSaving} />
              </ProgressTabContent>
            </ProgressTab>
          </div>
        </div>
      </div>
    </>
  )
})

export default VideoEditor
