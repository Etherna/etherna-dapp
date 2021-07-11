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

  return {
    updatePinContent,
    updateTitle,
    updateDescription,
  }
}

export default useVideoEditorInfoActions
