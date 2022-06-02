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
import type { VideoEditorContextState } from "@/definitions/video-editor-context"

export default function useVideoEditorExtrasActions() {
  const [, dispatch] = useVideoEditorState()

  /**
   * Update where to save the current video
   * 
   * @param saveTo Save to value
   */
  const updateSaveTo = (saveTo: VideoEditorContextState["saveTo"]) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_SAVE_TO, saveTo })
  )

  /**
   * Update whethere to offer video resources
   * 
   * @param offerResources Offer resoruces
   */
  const updateOfferResources = (offerResources: boolean) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_OFFER_RESOURCES, offerResources })
  )

  return {
    updateSaveTo,
    updateOfferResources,
  }
}
