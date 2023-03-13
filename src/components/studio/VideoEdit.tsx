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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Navigate } from "react-router-dom"

import { TrashIcon } from "@heroicons/react/24/outline"
import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"

import StudioEditView from "./StudioEditView"
import VideoEditor from "./video-editor/VideoEditor"
import { Button } from "@/components/ui/actions"
import useConfirmation from "@/hooks/useConfirmation"
import useSwarmVideo from "@/hooks/useSwarmVideo"
import routes from "@/routes"
import useUserStore from "@/stores/user"
import useVideoEditorStore from "@/stores/video-editor"

import type { VideoWithIndexes } from "@/types/video"
import type { Video } from "@etherna/api-js"

type VideoEditProps = {
  reference: string | undefined
  routeState?: {
    video: Video
  }
}

const VideoEdit: React.FC<VideoEditProps> = ({ reference, routeState }) => {
  const [isEmpty, setIsEmpty] = useState<boolean>()
  const [canSave, setCanSave] = useState<boolean>()
  const saveCallback = useRef<() => Promise<void>>()
  const address = useUserStore(state => state.address)
  const editorStatus = useVideoEditorStore(state => state.status)
  const hasChanges = useVideoEditorStore(state => state.hasChanges)
  const storeReference = useVideoEditorStore(state => state.reference)
  const storeVideo = useVideoEditorStore(state => state.video)
  const reset = useVideoEditorStore(state => state.reset)

  const isResultView = useMemo(() => {
    return editorStatus === "saved" || editorStatus === "error"
  }, [editorStatus])

  const stateVideo = useMemo(() => {
    if (!reference) {
      return undefined
    }

    const baseVideo = reference === storeReference ? storeVideo : routeState?.video
    const videoIndexes: VideoWithIndexes | undefined = baseVideo
      ? {
          ...baseVideo,
          indexesStatus: {},
        }
      : undefined
    return videoIndexes
  }, [reference, routeState?.video, storeReference, storeVideo])

  const { waitConfirmation } = useConfirmation()
  const { video, isLoading, loadVideo } = useSwarmVideo({
    reference: reference || "",
    routeState: stateVideo,
  })

  useEffect(() => {
    if (reference && !video) {
      loadVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  const backPrompt = useCallback(async () => {
    if (editorStatus === "saved") return true
    if (!hasChanges) return true

    const continueEditing = await waitConfirmation(
      "Cancel upload",
      "Are you sure you want to cancel this upload. The progress will be lost.",
      "Continue editing"
    )

    const navigateBack = !continueEditing

    navigateBack && reset()
    return navigateBack
  }, [editorStatus, hasChanges, reset, waitConfirmation])

  const handleSave = useCallback(async () => {
    await saveCallback.current?.()
  }, [])

  const askToClearState = useCallback(async () => {
    const clear = await waitConfirmation(
      "Clear all",
      "Are you sure you want to clear the upload data? This action cannot be reversed.",
      "Yes, clear",
      "destructive"
    )
    clear && reset()
  }, [reset, waitConfirmation])

  if (video && video.ownerAddress !== address) {
    return <Navigate to={routes.studioVideos} />
  }

  return (
    <StudioEditView
      title={isResultView ? "" : reference ? "Edit video" : "Publish new video"}
      saveLabel={reference ? "Update" : "Publish"}
      canSave={canSave}
      hideSaveButton={isResultView}
      actions={
        <>
          {!reference && editorStatus !== "saved" && (
            <Button
              aspect="text"
              color="muted"
              prefix={<TrashIcon width={16} />}
              onClick={askToClearState}
            >
              Clear all
            </Button>
          )}
        </>
      }
      backTo={routes.studioVideos}
      backPrompt={backPrompt}
      onSave={handleSave}
    >
      {isLoading || (reference && !video) ? (
        <Spinner className="mx-auto mt-10 w-10 text-primary-500" />
      ) : (
        <VideoEditor
          video={video}
          ref={ref => {
            if (!ref) return

            saveCallback.current = ref.submitVideo
            ref.isEmpty !== isEmpty && setIsEmpty(ref.isEmpty)
            ref.canSubmitVideo !== canSave && setCanSave(ref.canSubmitVideo)
          }}
        />
      )}
    </StudioEditView>
  )
}

export default VideoEdit
