import { VideoEditorContextState } from "."
import VideoEditorCache from "./VideoEditorCache"
import SwarmVideo from "@classes/SwarmVideo"

// Actions
export const ActionTypes = {
  ADD_TO_QUEUE: "ADD_TO_QUEUE",
  REMOVE_FROM_QUEUE: "REMOVE_FROM_QUEUE",
  UPDATE_QUEUE_COMPLETION: "UPDATE_QUEUE_COMPLETION",
  UPDATE_MANIFEST: "UPDATE_MANIFEST",
  UPDATE_ORIGINAL_QUALITY: "UPDATE_ORIGINAL_QUALITY",
  UPDATE_DURATION: "UPDATE_DURATION",
  UPDATE_TITLE: "UPDATE_TITLE",
  UPDATE_DESCRIPTION: "UPDATE_DESCRIPTION",
  UPDATE_PIN_CONTENT: "UPDATE_PIN_CONTENT",
  RESET: "RESET",
} as const

type AddToQueueAction = {
  type: typeof ActionTypes.ADD_TO_QUEUE
  name: string
}
type RemoveFromQueueAction = {
  type: typeof ActionTypes.REMOVE_FROM_QUEUE
  name: string
}
type UpdateQueueCompletionAction = {
  type: typeof ActionTypes.UPDATE_QUEUE_COMPLETION
  name: string
  completion: number
  finished?: boolean
}
type UpdateManifestAction = {
  type: typeof ActionTypes.UPDATE_MANIFEST
  manifest?: string
}
type UpdateOriginalQualityAction = {
  type: typeof ActionTypes.UPDATE_ORIGINAL_QUALITY
  quality: string
}
type UpdateDurationAction = {
  type: typeof ActionTypes.UPDATE_DURATION
  duration: number
}
type UpdatePinContentAction = {
  type: typeof ActionTypes.UPDATE_PIN_CONTENT
  pinContent: boolean
}
type UpdateTitleAction = {
  type: typeof ActionTypes.UPDATE_TITLE
  title: string
}
type UpdateDescriptionAction = {
  type: typeof ActionTypes.UPDATE_DESCRIPTION
  description: string
}
type ResetAction = {
  type: typeof ActionTypes.RESET
}
export type AnyAction = (
  AddToQueueAction |
  RemoveFromQueueAction |
  UpdateQueueCompletionAction |
  UpdateManifestAction |
  UpdateOriginalQualityAction |
  UpdateDurationAction |
  UpdatePinContentAction |
  UpdateTitleAction |
  UpdateDescriptionAction |
  ResetAction
)

// Reducer
export const reducer = (state: VideoEditorContextState, action: AnyAction): VideoEditorContextState => {
  let newState = state

  switch (action.type) {
    case ActionTypes.UPDATE_MANIFEST:
      newState = { ...state, manifest: action.manifest }
      break
    case ActionTypes.ADD_TO_QUEUE: {
      const queue = [...state.queue]
      queue.push({
        name: action.name,
        completion: null,
        finished: false,
      })
      newState = { ...state, queue }
      break
    }
    case ActionTypes.REMOVE_FROM_QUEUE: {
      const queue = [...state.queue]
      const index = queue.findIndex(e => e.name === action.name)
      if (index >= 0) {
        queue.splice(index, 1)
        newState = { ...state, queue }
      } else {
        newState = state
      }
      break
    }
    case ActionTypes.UPDATE_QUEUE_COMPLETION: {
      const queue = [...state.queue]
      const index = queue.findIndex(e => e.name === action.name)
      if (index >= 0) {
        queue[index].completion = action.completion
        queue[index].finished = action.finished || false
        newState = { ...state, queue }
      } else {
        newState = state
      }
      break
    }
    case ActionTypes.UPDATE_ORIGINAL_QUALITY:
      state.videoHandler.originalQuality = action.quality
      newState = { ...state }
      break
    case ActionTypes.UPDATE_DURATION:
      state.videoHandler.duration = action.duration
      newState = { ...state }
      break
    case ActionTypes.UPDATE_TITLE:
      state.videoHandler.title = action.title
      newState = { ...state }
      break
    case ActionTypes.UPDATE_DESCRIPTION:
      state.videoHandler.description = action.description
      newState = { ...state }
      break
    case ActionTypes.UPDATE_PIN_CONTENT:
      newState = { ...state, pinContent: action.pinContent }
      break
    case ActionTypes.RESET:
      newState = {
        reference: undefined,
        manifest: undefined,
        queue: [],
        pinContent: state.pinContent,
        videoHandler: new SwarmVideo(undefined, {
          beeClient: state.videoHandler.beeClient,
          indexClient: state.videoHandler.indexClient,
          fetchFromCache: state.videoHandler.fetchFromCache,
          updateCache: state.videoHandler.updateCache,
          fetchProfile: state.videoHandler.fetchProfile,
        })
      }
      break
  }

  if (action.type === ActionTypes.RESET) {
    VideoEditorCache.deleteCache()
  } else {
    VideoEditorCache.saveState(newState)
  }

  return newState
}