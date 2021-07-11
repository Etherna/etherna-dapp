import { useContext } from "react"

import { VideoEditorContext } from ".."

const useVideoEditorState = () => useContext(VideoEditorContext)!

export default useVideoEditorState
