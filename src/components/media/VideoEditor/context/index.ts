import { useContext, createContext, Dispatch, useMemo } from "react"

import { AnyAction } from "./videoEditorReducer"
import * as videoEditorActions from "./videoEditorActions"
import SwarmVideo from "@classes/SwarmVideo"

// Context
export const VideoEditorContext = createContext<VideoEditorContextStore | undefined>(undefined)

// Types
export type VideoEditorContextStore = [state: VideoEditorContextState, dispatch: Dispatch<AnyAction>]

export type VideoEditorContextState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Video instance */
  videoHandler: SwarmVideo
  /** Upload queue */
  queue: { name: string, completion: number | null, reference?: string }[]
  /** Pin content on Swarm */
  pinContent: boolean | undefined
}

// Hooks
export const useVideoEditorState = () => {
  const [state, dispatch] = useContext(VideoEditorContext)!

  const actions = useMemo(() => {
    return {
      addToQueue: videoEditorActions.addToQueue(state, dispatch),
      removeFromQueue: videoEditorActions.removeFromQueue(state, dispatch),
      updateCompletion: videoEditorActions.updateCompletion(state, dispatch),
      updateTitle: videoEditorActions.updateTitle(state, dispatch),
      updateDescription: videoEditorActions.updateDescription(state, dispatch),
      updateOriginalQuality: videoEditorActions.updateOriginalQuality(state, dispatch),
      updateVideoDuration: videoEditorActions.updateVideoDuration(state, dispatch),
      updatePinContent: videoEditorActions.updatePinContent(state, dispatch),
      resetState: videoEditorActions.resetState(state, dispatch),
    }
  }, [state, dispatch])

  return { state, actions }
}
