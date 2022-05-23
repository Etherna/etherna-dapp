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

import { VideoEditorContextState } from "."
import SwarmVideoIO from "@classes/SwarmVideo"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import type { SwarmVideoRaw } from "@definitions/swarm-video"

const STORAGE_KEY = "videoEditorState"

type CacheState = Omit<VideoEditorContextState, "videoWriter"> & {
  videoRaw: SwarmVideoRaw
}

export default class VideoEditorCache {
  static get hasCache(): boolean {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value) {
      try {
        JSON.parse(value) as CacheState
        return true
      } catch { }
    }
    return false
  }

  static get isCacheEmptyOrDefault(): boolean {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value) {
      try {
        const cache = JSON.parse(value) as CacheState
        return !cache.queue.length &&
          !cache.pinContent &&
          !cache.reference &&
          !cache.videoRaw.description &&
          !cache.videoRaw.title &&
          !cache.videoRaw.sources.length
      } catch { }
    }
    return true
  }

  static loadState(beeClient: SwarmBeeClient) {
    const value = window.localStorage.getItem(STORAGE_KEY)!
    const {
      reference,
      queue,
      videoRaw,
      pinContent,
      ownerAddress,
      hasChanges,
      offerResources,
      saveTo,
    } = JSON.parse(value) as CacheState
    const videoWriter = new SwarmVideoIO.Writer(undefined, ownerAddress, {
      beeClient,
    })
    videoWriter.reference = reference
    videoWriter.videoRaw = videoRaw

    // only keep successful uploads
    const filteredQueue = queue.filter(queue => !!queue.reference)

    const state: VideoEditorContextState = {
      reference,
      ownerAddress,
      queue: filteredQueue,
      videoWriter,
      pinContent,
      saveTo,
      offerResources,
      hasChanges,
    }

    return state
  }

  static saveState(state: VideoEditorContextState) {
    const {
      reference,
      queue,
      videoWriter,
      pinContent,
      ownerAddress,
      saveTo,
      offerResources,
      hasChanges,
    } = state
    const videoRaw = videoWriter.videoRaw

    const cacheState: CacheState = {
      reference,
      ownerAddress,
      queue,
      videoRaw,
      pinContent,
      saveTo,
      offerResources,
      hasChanges,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheState))
  }

  static deleteCache() {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
