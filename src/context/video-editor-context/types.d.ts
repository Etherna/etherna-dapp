import { Dispatch } from "react"

import { AnyVideoEditorAction } from "."
import SwarmVideo from "@classes/SwarmVideo"

export type VideoEditorContextStore = [state: VideoEditorContextState, dispatch: Dispatch<AnyVideoEditorAction>]

export type VideoEditorContextState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Video instance */
  videoHandler: SwarmVideo
  /** Upload queue */
  queue: VideoEditorQueue[]
  /** Pin content on Swarm */
  pinContent: boolean | undefined
}

export type VideoEditorQueue = {
  name: string
  completion: number | null
  reference?: string
}
