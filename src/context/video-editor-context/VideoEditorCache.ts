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
import SwarmVideo from "@classes/SwarmVideo"
import { SwarmVideoRaw } from "@classes/SwarmVideo/types"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"

const STORAGE_KEY = "videoEditorState"

type CacheState = Omit<VideoEditorContextState, "videoHandler"> & {
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

  static loadState(beeClient: SwarmBeeClient, indexClient: EthernaIndexClient) {
    const value = window.localStorage.getItem(STORAGE_KEY)!
    const { reference, queue, videoRaw, pinContent } = JSON.parse(value) as CacheState
    const videoHandler = new SwarmVideo(reference, {
      beeClient,
      indexClient,
      fetchFromCache: false,
      fetchProfile: false
    })
    videoHandler.hash = reference
    videoHandler.videoRaw = videoRaw

    const state: VideoEditorContextState = {
      reference,
      queue,
      videoHandler,
      pinContent
    }

    return state
  }

  static saveState(state: VideoEditorContextState) {
    const { reference, queue, videoHandler, pinContent } = state
    const videoRaw = videoHandler.videoRaw

    const cacheState: CacheState = {
      reference,
      queue,
      videoRaw,
      pinContent
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheState))
  }

  static deleteCache() {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
