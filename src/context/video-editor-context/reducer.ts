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

import { VideoEditorContextState, VideoEditorQueue } from "."
import VideoEditorCache from "./VideoEditorCache"
import { deepCloneArray } from "@utils/array"
import type { VideoEditorQueueName } from "@definitions/video-editor-context"
import type { SwarmVideoQuality } from "@definitions/swarm-video"

// Actions
export const VideoEditorActionTypes = {
  ADD_QUEUE: "videoeditor/add-queue",
  UPDATE_QUEUE: "videoeditor/update-queue",
  UPDATE_QUEUE_NAME: "videoeditor/update-queue-name",
  REMOVE_QUEUE: "videoeditor/remove-queue",
  UPDATE_ORIGINAL_QUALITY: "videoeditor/update-original-quality",
  UPDATE_DURATION: "videoeditor/update-duration",
  UPDATE_TITLE: "videoeditor/update-title",
  UPDATE_DESCRIPTION: "videoeditor/update-description",
  UPDATE_PIN_CONTENT: "videoeditor/update-pin-content",
  RESET: "videoeditor/reset",
} as const

type AddQueueAction = {
  type: typeof VideoEditorActionTypes.ADD_QUEUE
  name: VideoEditorQueueName
}
type UpdateQueueAction = {
  type: typeof VideoEditorActionTypes.UPDATE_QUEUE
  name: VideoEditorQueueName
  completion: number
  reference?: string
}
type UpdateQueueNameAction = {
  type: typeof VideoEditorActionTypes.UPDATE_QUEUE_NAME
  oldName: VideoEditorQueueName
  newName: VideoEditorQueueName
}
type RemoveQueueAction = {
  type: typeof VideoEditorActionTypes.REMOVE_QUEUE
  name: VideoEditorQueueName
}
type UpdateOriginalQualityAction = {
  type: typeof VideoEditorActionTypes.UPDATE_ORIGINAL_QUALITY
  quality: SwarmVideoQuality
}
type UpdateDurationAction = {
  type: typeof VideoEditorActionTypes.UPDATE_DURATION
  duration: number
}
type UpdatePinContentAction = {
  type: typeof VideoEditorActionTypes.UPDATE_PIN_CONTENT
  pinContent: boolean
}
type UpdateTitleAction = {
  type: typeof VideoEditorActionTypes.UPDATE_TITLE
  title: string
}
type UpdateDescriptionAction = {
  type: typeof VideoEditorActionTypes.UPDATE_DESCRIPTION
  description: string
}
type ResetAction = {
  type: typeof VideoEditorActionTypes.RESET
}

export type AnyVideoEditorAction = (
  AddQueueAction |
  UpdateQueueAction |
  UpdateQueueNameAction |
  RemoveQueueAction |
  UpdateOriginalQualityAction |
  UpdateDurationAction |
  UpdatePinContentAction |
  UpdateTitleAction |
  UpdateDescriptionAction |
  ResetAction
)

// Reducer
const videoEditorReducer = (state: VideoEditorContextState, action: AnyVideoEditorAction): VideoEditorContextState => {
  let newState = state

  switch (action.type) {
    case VideoEditorActionTypes.ADD_QUEUE:
      const addQueue: VideoEditorQueue[] = [...state.queue, {
        name: action.name,
        completion: null
      }]
      newState = { ...state, queue: addQueue }
      break
    case VideoEditorActionTypes.UPDATE_QUEUE:
      const updateQueue = deepCloneArray(state.queue)
      const updateQueueElement = updateQueue.find(q => q.name === action.name)
      if (updateQueueElement) updateQueueElement.completion = action.completion
      if (updateQueueElement) updateQueueElement.reference = action.reference
      newState = { ...state, queue: updateQueue }
      break
    case VideoEditorActionTypes.UPDATE_QUEUE_NAME:
      const updateNameQueue = deepCloneArray(state.queue)
      const updateQueueNameElement = updateNameQueue.find(q => q.name === action.oldName)
      if (updateQueueNameElement) updateQueueNameElement.name = action.newName
      newState = { ...state, queue: updateNameQueue }
      break
    case VideoEditorActionTypes.REMOVE_QUEUE:
      const removeQueue = [...state.queue]
      const removeIndex = removeQueue.findIndex(q => q.name === action.name)
      removeIndex >= 0 && removeQueue.splice(removeIndex, 1)
      newState = { ...state, queue: removeQueue }
      break
    case VideoEditorActionTypes.UPDATE_ORIGINAL_QUALITY:
      state.videoWriter.originalQuality = action.quality
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_DURATION:
      state.videoWriter.duration = action.duration
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_TITLE:
      state.videoWriter.title = action.title
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_DESCRIPTION:
      state.videoWriter.description = action.description
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_PIN_CONTENT:
      newState = { ...state, pinContent: action.pinContent }
      break
    case VideoEditorActionTypes.RESET:
      newState = {
        reference: undefined,
        queue: [],
        ownerAddress: state.ownerAddress,
        pinContent: state.pinContent,
        videoWriter: state.videoWriter.resetCopy()
      }
      break
  }

  if (action.type === VideoEditorActionTypes.RESET) {
    VideoEditorCache.deleteCache()
  } else {
    VideoEditorCache.saveState(newState)
  }

  return newState
}

export default videoEditorReducer
