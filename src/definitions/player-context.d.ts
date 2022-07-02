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
import type { AnyPlayerAction } from "@/context/player-context"

export type PlayerContextStore = [state: PlayerContextState, dispatch: Dispatch<AnyPlayerAction>]

export type PlayerContextState = {
  videoEl?: HTMLVideoElement & {
    requestPictureInPicture?: () => void
    mozRequestFullScreen?: () => void
    webkitRequestFullScreen?: () => void
  }
  source?: string
  sourceSize?: number
  sourceQualities: string[]
  currentQuality?: string
  isPlaying: boolean
  duration: number
  currentTime: number
  buffering: number
  volume: number
  muted: boolean
  playbackRate: number
  error?: {
    code: number
    message: string
  }
}
