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

import { VideoEditorActionTypes } from "../reducer"
import useVideoEditorState from "./useVideoEditorState"
import type { SwarmVideoQuality } from "@/definitions/swarm-video"

const useVideoEditorBaseActions = () => {
  const [, dispatch] = useVideoEditorState()

  /**
   * Update video original quality
   * @param quality Original video quality (eg: 720p)
   */
  const updateOriginalQuality = (quality: SwarmVideoQuality) =>
    dispatch({ type: VideoEditorActionTypes.UPDATE_ORIGINAL_QUALITY, quality })

  /**
   * Update video duration
   * @param duration Video duration in seconds
   */
  const updateVideoDuration = (duration: number) =>
    dispatch({ type: VideoEditorActionTypes.UPDATE_DURATION, duration })

  /**
   * Reset state
   */
  const resetState = () => dispatch({ type: VideoEditorActionTypes.RESET })

  return {
    updateOriginalQuality,
    updateVideoDuration,
    resetState,
  }
}

export default useVideoEditorBaseActions
