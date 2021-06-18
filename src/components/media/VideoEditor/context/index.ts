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
 */

import { useContext, createContext, Dispatch, useMemo } from "react"

import { AnyAction } from "./videoEditorReducer"
import * as videoEditorActions from "./videoEditorActions"
import SwarmVideo from "@classes/SwarmVideo"

// Context
export const VideoEditorContext = createContext<VideoEditorContextStore | undefined>(undefined)

// Types
export type VideoEditorContextStore = [state: VideoEditorContextState, dispatch: Dispatch<AnyAction>]

export type VideoEditorContextState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Video instance */
  videoHandler: SwarmVideo
  /** Upload queue */
  queue: { name: string, completion: number | null, reference?: string }[]
  /** Pin content on Swarm */
  pinContent: boolean | undefined
}

// Hooks
export const useVideoEditorState = () => {
  const [state, dispatch] = useContext(VideoEditorContext)!

  const actions = useMemo(() => {
    return {
      addToQueue: videoEditorActions.addToQueue(state, dispatch),
      removeFromQueue: videoEditorActions.removeFromQueue(state, dispatch),
      updateQueueName: videoEditorActions.updateQueueName(state, dispatch),
      updateCompletion: videoEditorActions.updateCompletion(state, dispatch),
      updateTitle: videoEditorActions.updateTitle(state, dispatch),
      updateDescription: videoEditorActions.updateDescription(state, dispatch),
      updateOriginalQuality: videoEditorActions.updateOriginalQuality(state, dispatch),
      updateVideoDuration: videoEditorActions.updateVideoDuration(state, dispatch),
      updatePinContent: videoEditorActions.updatePinContent(state, dispatch),
      resetState: videoEditorActions.resetState(state, dispatch),
    }
  }, [state, dispatch])

  return { state, actions }
}
