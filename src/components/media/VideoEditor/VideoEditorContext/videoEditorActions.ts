import { Dispatch } from "react"

import { VideoEditorContextState } from "."
import { ActionTypes, AnyAction } from "./videoEditorReducer"

export const updateManifest = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update the video manifest
   * @param manifest The new video manifest hash
   */
  (manifest: string) => {
    dispatch({ type: ActionTypes.UPDATE_MANIFEST, manifest })
  }
)

export const addToQueue = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Add a queue instance
   * @param name Queue name
   */
  (name: string) => {
    dispatch({ type: ActionTypes.ADD_TO_QUEUE, name })
  }
)

export const removeFromQueue = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Remove a queue
   * @param name Queue name
   */
  (name: string) => {
    dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, name })
  }
)

export const updatePinContent = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update pinning
   * @param pinContent Pinning enabled
   */
  (pinContent: boolean) => {
    dispatch({ type: ActionTypes.UPDATE_PIN_CONTENT, pinContent })
  }
)

export const updateCompletion = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update queue progress/completion
   * @param name Queue name
   * @param completion Completion percentage [0-100]
   * @param finished Whether the upload has finished (default false)
   */
  (name: string, completion: number, finished = false) => {
    let clampedValue = completion - (completion % 10) + 5
    clampedValue = clampedValue > 100 ? 100 : clampedValue

    const queued = state.queue.find(q => q.name === name)
    if (finished || (queued && queued.completion !== clampedValue)) {
      dispatch({
        type: ActionTypes.UPDATE_QUEUE_COMPLETION,
        name,
        completion: clampedValue,
        finished,
      })
    }
  }
)

export const updateTitle = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update video title
   * @param title Video title
   */
  (title: string) => {
    dispatch({ type: ActionTypes.UPDATE_TITLE, title })
  }
)

export const updateDescription = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update video description
   * @param description Video description
   */
  (description: string) => {
    dispatch({ type: ActionTypes.UPDATE_DESCRIPTION, description })
  }
)

export const updateOriginalQuality = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update video original quality
   * @param quality Original video quality (eg: 720p)
   */
  (quality: string) => {
    dispatch({ type: ActionTypes.UPDATE_ORIGINAL_QUALITY, quality })
  }
)

export const updateVideoDuration = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Update video duration
   * @param duration Video duration in seconds
   */
  (duration: number) => {
    dispatch({ type: ActionTypes.UPDATE_DURATION, duration })
  }
)

export const resetState = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * Reset state
   */
  () => {
    dispatch({ type: ActionTypes.RESET })
  }
)
