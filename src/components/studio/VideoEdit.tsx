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

import React, { useEffect, useRef, useState } from "react"
import { Navigate } from "react-router-dom"

import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"
import { ReactComponent as TrashIcon } from "@assets/icons/trash.svg"

import StudioEditView from "./StudioEditView"
import VideoEditor from "./video-editor/VideoEditor"
import CantUploadAlert from "./other/CantUploadAlert"
import Button from "@common/Button"
import { VideoEditorContextProvider } from "@context/video-editor-context"
import useSwarmVideo from "@hooks/useSwarmVideo"
import routes from "@routes"
import useSelector from "@state/useSelector"
import { useConfirmation } from "@state/hooks/ui"
import type { Video } from "@definitions/swarm-video"

type VideoEditProps = {
  reference: string | undefined
  routeState?: Video
}

const VideoEdit: React.FC<VideoEditProps> = ({ reference, routeState }) => {
  const [isEmpty, setIsEmpty] = useState<boolean>()
  const [canSave, setCanSave] = useState<boolean>()
  const saveCallback = useRef<() => Promise<void>>()
  const clearCallback = useRef<() => Promise<void>>()
  const resetState = useRef<() => void>()
  const { address } = useSelector(state => state.user)

  const { waitConfirmation } = useConfirmation()
  const { video, isLoading, loadVideo } = useSwarmVideo({
    reference: reference || "",
    fetchProfile: false,
    fetchFromCache: false,
    routeState,
  })

  useEffect(() => {
    if (reference && !video) {
      loadVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  const backPrompt = async () => {
    if (isEmpty || reference) return true
    const continueEditing = await waitConfirmation(
      "Cancel upload",
      "Are you sure you want to cancel this upload. The progress will be lost.",
      "Continue editing",
    )
    !continueEditing && resetState.current?.()
    return !continueEditing
  }

  if (video && video.ownerAddress !== address) {
    return <Navigate to={routes.studioVideos} />
  }

  const handleSave = async () => {
    await saveCallback.current?.()
  }

  const askToClearState = async () => {
    await clearCallback.current?.()
  }

  return (
    <>
      <CantUploadAlert />

      <StudioEditView
        title={reference ? "Edit video" : "Publish new video"}
        saveLabel={reference ? "Update" : "Publish"}
        canSave={canSave}
        actions={
          <Button aspect="link" modifier="muted" onClick={askToClearState}>
            <TrashIcon /> Clear all
          </Button>
        }
        backTo={routes.studioVideos}
        backPrompt={backPrompt}
        onSave={handleSave}
      >
        {isLoading || (reference && !video) ? (
          <Spinner className="mt-10 mx-auto w-10 text-primary-500" />
        ) : (
          <VideoEditorContextProvider reference={reference} videoData={video!}>
            <VideoEditor ref={ref => {
              if (!ref) return

              saveCallback.current = ref.submitVideo
              clearCallback.current = ref.askToClearState
              resetState.current = ref.resetState
              ref.isEmpty !== isEmpty && setIsEmpty(ref.isEmpty)
              ref.canSubmitVideo !== canSave && setCanSave(ref.canSubmitVideo)
            }} />
          </VideoEditorContextProvider>
        )}
      </StudioEditView>
    </>
  )
}

export default VideoEdit
