import { createContext } from "react"

import { VideoEditorContextStore } from "./types"

export const VideoEditorContext = createContext<VideoEditorContextStore | undefined>(undefined)

// forward exports
export { default as VideoEditorContextProvider } from "./VideoEditorContextProvider"
export { VideoEditorActionTypes } from "./reducer"
export type { AnyVideoEditorAction } from "./reducer"
export type { VideoEditorContextStore, VideoEditorContextState, VideoEditorQueue } from "./types"
