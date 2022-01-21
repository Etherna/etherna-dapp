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

import type { Dispatch } from "react"

import { THUMBNAIL_QUEUE_NAME } from "@components/studio/video-editor/ThumbnailUpload"
import type { AnyVideoEditorAction } from "@context/video-editor-context"
import type SwarmVideoWriter from "@classes/SwarmVideo/SwarmVideoWriter"
import type { SwarmVideoQuality } from "./swarm-video"

export type VideoEditorContextStore = [state: VideoEditorContextState, dispatch: Dispatch<AnyVideoEditorAction>]

export type VideoEditorContextState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Video instance */
  videoWriter: SwarmVideoWriter
  /** Address of the video owner */
  ownerAddress: string
  /** Upload queue */
  queue: VideoEditorQueue[]
  /** Pin content on Swarm */
  pinContent: boolean | undefined
}

export type VideoEditorQueueName = SwarmVideoQuality | typeof THUMBNAIL_QUEUE_NAME

export type VideoEditorQueue = {
  name: VideoEditorQueueName
  completion: number | null
  reference?: string
}
