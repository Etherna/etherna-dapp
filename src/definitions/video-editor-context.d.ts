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

import type { SwarmVideoQuality } from "./swarm-video"
import type { EthAddress } from "@/classes/BeeClient/types"
import type SwarmVideoWriter from "@/classes/SwarmVideo/SwarmVideoWriter"
import type { THUMBNAIL_QUEUE_NAME } from "@/components/studio/video-editor/ThumbnailUpload"
import type { AnyVideoEditorAction } from "@/context/video-editor-context"

export type VideoEditorContextStore = [
  state: VideoEditorContextState,
  dispatch: Dispatch<AnyVideoEditorAction>
]

export type VideoEditorContextState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Video instance */
  videoWriter: SwarmVideoWriter
  /** Address of the video owner */
  ownerAddress: EthAddress
  /** Upload queue */
  queue: VideoEditorQueue[]
  /** Pin content on Swarm */
  pinContent: boolean | undefined
  /** Whether the video resources are already offered by user */
  isOffered: boolean | undefined
  /** Whether the video resources should be offered */
  offerResources: boolean
  /** A map with various indexes ids of the video */
  indexData: {
    indexUrl: string
    videoId: string
  }[]
  /** All the publishing sources */
  sources: PublishSource[]
  /** Sources where to publish the video to */
  saveTo: PublishSourceSave[]
  /** Whether the user made come changes */
  hasChanges: boolean
  /** Whether the description is too long */
  descriptionExeeded: boolean
}

export type PublishSourceType = "playlist" | "index"

export type PublishSource = {
  source: PublishSourceType
  /** the id for playlists or the url for the index */
  identifier: string
  name: string
  description: string
  videoId: string | undefined
}

export type PublishSourceSave = Omit<PublishSource, "name" | "description" | "videoId"> & {
  add: boolean
}

export type VideoEditorQueueName = SwarmVideoQuality | typeof THUMBNAIL_QUEUE_NAME

export type VideoEditorQueue = {
  name: VideoEditorQueueName
  completion: number | null
  reference?: string
  error?: string
}
