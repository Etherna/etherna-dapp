import useVideoEditorState from "./useVideoEditorState"
import { VideoEditorActionTypes } from "../reducer"
import type { VideoEditorContextState } from "@definitions/video-editor-context"

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
