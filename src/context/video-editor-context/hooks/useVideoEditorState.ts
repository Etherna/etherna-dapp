import { useContext } from "react"

import { VideoEditorContext } from ".."
import { VideoEditorContextStore } from "../types"

const useVideoEditorState = (): VideoEditorContextStore => {
  const context = useContext(VideoEditorContext)
  if (!context) {
    console.warn("Context is not defined", context)
  }
  return context!
}

export default useVideoEditorState
