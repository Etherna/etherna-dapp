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

import { useCallback } from "react"

import { VideoEditorActionTypes } from "../reducer"
import useVideoEditorState from "./useVideoEditorState"
import type { PublishSource, PublishSourceSave } from "@/types/video-editor-context"

export default function useVideoEditorExtrasActions() {
  const [{ saveTo, isOffered, offerResources }, dispatch] = useVideoEditorState()

  /**
   * Update where to save the current video
   *
   * @param source Save to value
   */
  const toggleAddTo = useCallback(
    (source: PublishSourceSave) => {
      dispatch({
        type: VideoEditorActionTypes.TOGGLE_SAVE_TO,
        sourceSave: source,
      })
    },
    [dispatch]
  )

  /**
   * Update where to save the current video
   *
   * @param source Save to value
   */
  const updateSources = useCallback(
    (sources: PublishSource[]) => {
      dispatch({
        type: VideoEditorActionTypes.UPDATE_SOURCES,
        sources,
      })
    },
    [dispatch]
  )

  /**
   * Update whethere to offer video resources
   *
   * @param offerResources Offer resoruces
   */
  const updateOfferResources = useCallback(
    (offerResources: boolean) =>
      dispatch({ type: VideoEditorActionTypes.UPDATE_OFFER_RESOURCES, offerResources }),
    [dispatch]
  )

  return {
    saveTo,
    isOffered,
    offerResources,
    toggleAddTo,
    updateSources,
    updateOfferResources,
  }
}
