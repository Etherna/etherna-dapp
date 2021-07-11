import useVideoEditorState from "./useVideoEditorState"
import { VideoEditorActionTypes } from "../reducer"

const useVideoEditorBaseActions = () => {
  const [, dispatch] = useVideoEditorState()

  /**
   * Update video original quality
   * @param quality Original video quality (eg: 720p)
   */
  const updateOriginalQuality = (quality: string) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_ORIGINAL_QUALITY, quality })
  )

  /**
   * Update video duration
   * @param duration Video duration in seconds
   */
  const updateVideoDuration = (duration: number) => (
    dispatch({ type: VideoEditorActionTypes.UPDATE_DURATION, duration })
  )

  /**
   * Reset state
   */
  const resetState = () => (
    dispatch({ type: VideoEditorActionTypes.RESET })
  )

  return {
    updateOriginalQuality,
    updateVideoDuration,
    resetState,
  }
}

export default useVideoEditorBaseActions
