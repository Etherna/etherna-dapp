import { VideoEditorContextState, VideoEditorQueue } from "."
import VideoEditorCache from "./VideoEditorCache"
import SwarmVideo from "@classes/SwarmVideo"

// Actions
export const VideoEditorActionTypes = {
  UPDATE_QUEUE: "videoeditor/update-queue",
  UPDATE_ORIGINAL_QUALITY: "videoeditor/update-original-quality",
  UPDATE_DURATION: "videoeditor/update-duration",
  UPDATE_TITLE: "videoeditor/update-title",
  UPDATE_DESCRIPTION: "videoeditor/update-description",
  UPDATE_PIN_CONTENT: "videoeditor/update-pin-content",
  RESET: "videoeditor/reset",
} as const

type UpdateQueueAction = {
  type: typeof VideoEditorActionTypes.UPDATE_QUEUE
  queue: VideoEditorQueue[]
}
type UpdateOriginalQualityAction = {
  type: typeof VideoEditorActionTypes.UPDATE_ORIGINAL_QUALITY
  quality: string
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
  UpdateQueueAction |
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
    case VideoEditorActionTypes.UPDATE_QUEUE:
      newState = { ...state, queue: action.queue }
      break
    case VideoEditorActionTypes.UPDATE_ORIGINAL_QUALITY:
      state.videoHandler.originalQuality = action.quality
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_DURATION:
      state.videoHandler.duration = action.duration
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_TITLE:
      state.videoHandler.title = action.title
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_DESCRIPTION:
      state.videoHandler.description = action.description
      newState = { ...state }
      break
    case VideoEditorActionTypes.UPDATE_PIN_CONTENT:
      newState = { ...state, pinContent: action.pinContent }
      break
    case VideoEditorActionTypes.RESET:
      newState = {
        reference: undefined,
        queue: [],
        pinContent: state.pinContent,
        videoHandler: new SwarmVideo(undefined, {
          beeClient: state.videoHandler.beeClient,
          indexClient: state.videoHandler.indexClient,
          fetchFromCache: state.videoHandler.fetchFromCache,
          updateCache: state.videoHandler.updateCache,
          fetchProfile: state.videoHandler.fetchProfile,
          profileData: state.videoHandler.owner
        })
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
