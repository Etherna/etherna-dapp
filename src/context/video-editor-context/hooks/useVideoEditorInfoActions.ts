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

const useVideoEditorInfoActions = () => {
  const [, dispatch] = useVideoEditorState()

  /**
   * Update pinning
   * @param pinContent Pinning enabled
   */
  const updatePinContent = (pinContent: boolean) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_PIN_CONTENT, pinContent })
  )

  /**
   * Update video title
   * @param title Video title
   */
  const updateTitle = (title: string) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_TITLE, title })
  )

  /**
   * Update video description
   * @param description Video description
   */
  const updateDescription = (description: string) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_DESCRIPTION, description })
  )

  /**
   * Cache current video state
   */
  const cacheState = () => (
    dispatch({ type: VideoEditorActionTypes.CACHE })
  )

  return {
    updatePinContent,
    updateTitle,
    updateDescription,
    cacheState,
  }
}

export default useVideoEditorInfoActions
