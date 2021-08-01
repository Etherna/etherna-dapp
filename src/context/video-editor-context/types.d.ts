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
