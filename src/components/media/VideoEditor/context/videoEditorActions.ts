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

import { Dispatch } from "react"

import { VideoEditorContextState } from "."
import { ActionTypes, AnyAction } from "./videoEditorReducer"

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

export const updateQueueName = (state: VideoEditorContextState, dispatch: Dispatch<AnyAction>) => (
  /**
   * change a queue name
   * @param oldName Current Queue name
   * @param newName New Queue name
   */
  (oldName: string, newName: string) => {
    dispatch({ type: ActionTypes.UPDATE_QUEUE_NAME, oldName, newName })
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
  (name: string, completion: number, reference?: string) => {
    let clampedValue = completion - (completion % 10) + 5
    clampedValue = clampedValue > 100 ? 100 : clampedValue

    const queued = state.queue.find(q => q.name === name)
    if (reference || (queued && queued.completion !== clampedValue)) {
      dispatch({
        type: ActionTypes.UPDATE_QUEUE_COMPLETION,
        name,
        completion: clampedValue,
        reference,
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
