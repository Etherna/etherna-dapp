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

import React, { useEffect, useImperativeHandle, useMemo, useState } from "react"
import { useNavigate } from "react-router"
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
  useVideoEditorInfoActions,
  useVideoEditorSaveActions,
  useVideoEditorState
} from "@/context/video-editor-context/hooks"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { useWallet } from "@/state/hooks/env"
import { useConfirmation, useErrorMessage } from "@/state/hooks/ui"
import useBatchesStore from "@/stores/batches"

const PORTAL_ID = "video-drag-portal"

export type VideoEditorHandle = {
  canSubmitVideo: boolean
  isEmpty: boolean
  submitVideo(): Promise<void>
  askToClearState(): Promise<void>
  resetState(): void
}

const VideoEditor = React.forwardRef<VideoEditorHandle, any>((_, ref) => {
  const navigate = useNavigate()
  const { defaultBatchId } = useSelector(state => state.user)
  const [{
    reference,
    queue,
    videoWriter,
    hasChanges,
    saveTo,
    offerResources,
    descriptionExeeded
  }] = useVideoEditorState()
  const [privateLink, setPrivateLink] = useState<string>()
  const [batchStatus, setBatchStatus] = useState<"creating" | "fetching" | "updating" | undefined>()
  const removeBatchUpdate = useBatchesStore(state => state.removeBatchUpdate)

  const {
    reference: newReference,
    isSaving,
    pusblishStatus,
    resourcesOffered,
    saveVideoTo,
    reSaveTo,
    saveVideoResources,
    resetState: resetSaveState,
  } = useVideoEditorSaveActions()
  const { cacheState } = useVideoEditorInfoActions()

  const { resetState } = useVideoEditorBaseActions()
  const { waitConfirmation } = useConfirmation()
  const { showError } = useErrorMessage()
  const hasOriginalVideo = videoWriter.originalQuality && videoWriter.sources.length > 0
  const canPublishVideo = !!videoWriter.videoRaw.title && hasOriginalVideo
  const hasQueuedProcesses = useMemo(() => {
    return queue.filter(q => !q.reference).length > 0
  }, [queue])
  const isPrivateVideo = useMemo(() => {
    return saveTo.every(s => !s.add)
  }, [saveTo])
  const saveRedirect = useMemo(() => {
    const hasPublishErrors = pusblishStatus?.some(s => !s.ok)
    return !!newReference && !isPrivateVideo && !hasPublishErrors
  }, [newReference, pusblishStatus, isPrivateVideo])

  useImperativeHandle(ref, () => ({
    isEmpty: queue.length === 0,
    canSubmitVideo: canPublishVideo && !hasQueuedProcesses && !descriptionExeeded,
    submitVideo: () => saveVideoTo(saveTo, offerResources),
    resetState: resetAll,
    askToClearState,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [canPublishVideo, hasQueuedProcesses, offerResources, queue, saveVideoTo, descriptionExeeded])

  useEffect(() => {
    if (newReference && isPrivateVideo) {
      setPrivateLink(location.origin + routes.watch(newReference))
    }
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

    videoWriter.onBatchCreating = () => { setBatchStatus("creating") }
    videoWriter.onBatchCreatedPending = () => { cacheState() }
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

    if (videoWriter.videoRaw.batchId) {
      removeBatchUpdate(videoWriter.videoRaw.batchId)
    }
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
    resetAll()
    navigate(routes.studioVideos)
  }

  const usePortal = !reference && !hasChanges && (pusblishStatus ?? []).length === 0

  return (
    <>
      <div className="my-6 space-y-4">
        <WalletState />

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

        {pusblishStatus?.filter(status => !status.ok).map(({ source, type }) => (
          <Alert
            type="warning"
            title={`Video not added to ${source.name}`}
            key={source.source + source.identifier}
          >
            Try again!
            <br />
            <Button
              loading={isSaving}
              onClick={() => reSaveTo(
                saveTo.find(s => s.source === source.source && s.identifier === source.identifier)!
              )}
            >
              {type === "add" ? "Add to " : "Remove from "}
              {source.name}
            </Button>
          </Alert>
        ))}

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

      {!pusblishStatus?.length && (
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
      )}
    </>
  )
})

export default VideoEditor
