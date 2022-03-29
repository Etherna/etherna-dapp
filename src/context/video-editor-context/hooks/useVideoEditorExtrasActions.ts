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

  return {
    updateSaveTo,
  }
}
