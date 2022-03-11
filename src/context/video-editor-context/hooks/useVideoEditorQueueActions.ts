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

import useVideoEditorState from "./useVideoEditorState"
import { VideoEditorActionTypes } from "../reducer"
import { clamp } from "@utils/math"
import type { VideoEditorQueueName } from "@definitions/video-editor-context"

const useVideoEditorQueueActions = () => {
  const [, dispatch] = useVideoEditorState()

  /**
   * Add a queue instance
   * @param name Queue name
   */
  const addToQueue = (name: VideoEditorQueueName) => {
    dispatch({
      type: VideoEditorActionTypes.ADD_QUEUE,
      name
    })
  }

  /**
   * Remove a queue
   * @param name Queue name
   */
  const removeFromQueue = (name: VideoEditorQueueName) => {
    dispatch({
      type: VideoEditorActionTypes.REMOVE_QUEUE,
      name
    })
  }

  /**
   * Update queue progress/completion
   * @param name Queue name
   * @param completion Completion percentage [0-100]
   * @param finished Whether the upload has finished (default false)
   */
  const updateQueueCompletion = (name: VideoEditorQueueName, completion: number, reference?: string) => {
    const clampedValue = clamp(
      Math.round(completion),
      0, 100
    )

    dispatch({
      type: VideoEditorActionTypes.UPDATE_QUEUE,
      name,
      completion: clampedValue,
      reference
    })
  }

  /**
   * change a queue name
   * @param oldName Current Queue name
   * @param newName New Queue name
   */
  const updateQueueName = (oldName: VideoEditorQueueName, newName: VideoEditorQueueName) => {
    dispatch({
      type: VideoEditorActionTypes.UPDATE_QUEUE_NAME,
      oldName,
      newName
    })
  }

  /**
   * Set a queue error
   * @param name Queue name
   */
  const setQueueError = (name: VideoEditorQueueName, errorMessage: string | undefined) => {
    dispatch({
      type: VideoEditorActionTypes.SET_QUEUE_ERROR,
      name,
      errorMessage,
    })
  }

  return {
    addToQueue,
    removeFromQueue,
    updateQueueName,
    updateQueueCompletion,
    setQueueError,
  }
}

export default useVideoEditorQueueActions
