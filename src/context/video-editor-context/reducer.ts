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

import type { VideoQuality } from "@etherna/api-js/schemas/video"

import type { VideoEditorContextState, VideoEditorQueue } from "."
import { getAllSources, getDefaultAddTo } from "."
import VideoEditorCache from "./VideoEditorCache"
import type {
  PublishSource,
  PublishSourceSave,
  VideoEditorQueueName,
} from "@/types/video-editor-context"
import { deepCloneArray } from "@/utils/array"

// Actions
export const VideoEditorActionTypes = {
  ADD_QUEUE: "videoeditor/add-queue",
  UPDATE_QUEUE: "videoeditor/update-queue",
  UPDATE_QUEUE_NAME: "videoeditor/update-queue-name",
  SET_QUEUE_ERROR: "videoeditor/set-queue-error",
  REMOVE_QUEUE: "videoeditor/remove-queue",
  UPDATE_ORIGINAL_QUALITY: "videoeditor/update-original-quality",
  UPDATE_DURATION: "videoeditor/update-duration",
  UPDATE_TITLE: "videoeditor/update-title",
  UPDATE_DESCRIPTION: "videoeditor/update-description",
  UPDATE_DESCRIPTION_EXCEEDED: "videoeditor/update-description-exceeded",
  UPDATE_PIN_CONTENT: "videoeditor/update-pin-content",
  UPDATE_IS_OFFERED: "videoeditor/update-is-offered",
  UPDATE_OFFER_RESOURCES: "videoeditor/update-offer-resources",
  UPDATE_INDEX_DATA: "videoeditor/update-index-data",
  UPDATE_SOURCES: "videoeditor/update-sources",
  TOGGLE_SAVE_TO: "videoeditor/toggle-save-to",
  RESET: "videoeditor/reset",
  CACHE: "videoeditor/cache",
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
type SetQueueError = {
  type: typeof VideoEditorActionTypes.SET_QUEUE_ERROR
  name: VideoEditorQueueName
  errorMessage: string | undefined
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
  quality: VideoQuality
}
type UpdateDurationAction = {
  type: typeof VideoEditorActionTypes.UPDATE_DURATION
  duration: number
}
type UpdatePinContentAction = {
  type: typeof VideoEditorActionTypes.UPDATE_PIN_CONTENT
  pinContent: boolean
}
type UpdateOfferResourcesAction = {
  type: typeof VideoEditorActionTypes.UPDATE_OFFER_RESOURCES
  offerResources: boolean
}
type UpdateIsOfferedAction = {
  type: typeof VideoEditorActionTypes.UPDATE_IS_OFFERED
  isOffered: boolean
}
type UpdateIndexDataAction = {
  type: typeof VideoEditorActionTypes.UPDATE_INDEX_DATA
  indexData: VideoEditorContextState["indexData"]
}
type ToggleSaveToAction = {
  type: typeof VideoEditorActionTypes.TOGGLE_SAVE_TO
  sourceSave: PublishSourceSave
}
type UpdateTitleAction = {
  type: typeof VideoEditorActionTypes.UPDATE_TITLE
  title: string
}
type UpdateDescriptionAction = {
  type: typeof VideoEditorActionTypes.UPDATE_DESCRIPTION
  description: string
}
type UpdateDescriptionExceededAction = {
  type: typeof VideoEditorActionTypes.UPDATE_DESCRIPTION_EXCEEDED
  descriptionExeeded: boolean
}
type UpdateSourcesAction = {
  type: typeof VideoEditorActionTypes.UPDATE_SOURCES
  sources: PublishSource[]
}
type ResetAction = {
  type: typeof VideoEditorActionTypes.RESET
}
type CacheAction = {
  type: typeof VideoEditorActionTypes.CACHE
}

export type AnyVideoEditorAction =
  | AddQueueAction
  | UpdateQueueAction
  | SetQueueError
  | UpdateQueueNameAction
  | RemoveQueueAction
  | UpdateOriginalQualityAction
  | UpdateDurationAction
  | UpdatePinContentAction
  | UpdateOfferResourcesAction
  | UpdateIsOfferedAction
  | UpdateIndexDataAction
  | ToggleSaveToAction
  | UpdateTitleAction
  | UpdateDescriptionAction
  | UpdateDescriptionExceededAction
  | UpdateSourcesAction
  | ResetAction
  | CacheAction

const changingExcludeActions: string[] = [
  VideoEditorActionTypes.UPDATE_DESCRIPTION_EXCEEDED,
  VideoEditorActionTypes.UPDATE_INDEX_DATA,
  VideoEditorActionTypes.UPDATE_OFFER_RESOURCES,
  VideoEditorActionTypes.UPDATE_SOURCES,
  VideoEditorActionTypes.RESET,
]

// Reducer
const videoEditorReducer = (
  state: VideoEditorContextState,
  action: AnyVideoEditorAction
): VideoEditorContextState => {
  let newState = state

  switch (action.type) {
    case VideoEditorActionTypes.ADD_QUEUE:
      const addQueue: VideoEditorQueue[] = [
        ...state.queue,
        {
          name: action.name,
          completion: null,
        },
      ]
      newState = { ...state, queue: addQueue }
      break
    case VideoEditorActionTypes.UPDATE_QUEUE:
      const updateQueue = deepCloneArray(state.queue)
      const updateQueueElement = updateQueue.find(q => q.name === action.name)
      if (updateQueueElement) updateQueueElement.completion = action.completion
      if (updateQueueElement) updateQueueElement.reference = action.reference
      newState = { ...state, queue: updateQueue }
      break
    case VideoEditorActionTypes.SET_QUEUE_ERROR:
      const setErrorQueue = deepCloneArray(state.queue)
      const setErrorQueueElement = setErrorQueue.find(q => q.name === action.name)
      if (setErrorQueueElement) setErrorQueueElement.error = action.errorMessage
      if (setErrorQueueElement) setErrorQueueElement.completion = null
      newState = { ...state, queue: setErrorQueue }
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
      state.videoWriter.duration = Math.round(action.duration)
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
    case VideoEditorActionTypes.UPDATE_DESCRIPTION_EXCEEDED:
      state.descriptionExeeded = action.descriptionExeeded
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_INDEX_DATA:
      newState = { ...state, indexData: action.indexData }
      break
    case VideoEditorActionTypes.TOGGLE_SAVE_TO:
      state.saveTo = state.saveTo.map(({ source, identifier, add }) => ({
        source,
        identifier,
        add:
          source === action.sourceSave.source && identifier === action.sourceSave.identifier
            ? action.sourceSave.add
            : add,
      }))
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_PIN_CONTENT:
      newState = { ...state, pinContent: action.pinContent }
      break
    case VideoEditorActionTypes.UPDATE_IS_OFFERED:
      newState = { ...state, isOffered: action.isOffered }
      break
    case VideoEditorActionTypes.UPDATE_OFFER_RESOURCES:
      newState = { ...state, offerResources: action.offerResources }
      break
    case VideoEditorActionTypes.UPDATE_SOURCES:
      newState = { ...state, sources: action.sources }
      break
    case VideoEditorActionTypes.RESET:
      newState = {
        reference: undefined,
        queue: [],
        ownerAddress: state.ownerAddress,
        pinContent: state.pinContent,
        videoWriter: state.videoWriter.resetCopy(),
        hasChanges: false,
        offerResources: false,
        descriptionExeeded: false,
        saveTo: getDefaultAddTo(),
        sources: getAllSources(),
        indexData: [],
        isOffered: undefined,
      }
      break
  }

  if (action.type === VideoEditorActionTypes.RESET) {
    VideoEditorCache.deleteCache()
  } else {
    if (!changingExcludeActions.includes(action.type)) {
      newState.hasChanges = true
    }
    VideoEditorCache.saveState(newState)
  }

  return newState
}

export default videoEditorReducer
