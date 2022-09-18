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

import type { VideoEditorContextState } from "."
import { getAllSources } from "."
import type BeeClient from "@/classes/BeeClient"
import type GatewayClient from "@/classes/GatewayClient"
import SwarmVideo from "@/classes/SwarmVideo"
import type { GatewayType } from "@/definitions/extension-host"
import type { SwarmVideoRaw } from "@/definitions/swarm-video"

const STORAGE_KEY = "videoEditorState"

/* eslint-disable @typescript-eslint/indent */
type ReducedContextState = Omit<
  VideoEditorContextState,
  "videoWriter" | "descriptionExeeded" | "isOffered" | "indexData" | "sources"
>
/* eslint-enable @typescript-eslint/indent */

type CacheState = ReducedContextState & {
  videoRaw: SwarmVideoRaw
}

export default class VideoEditorCache {
  static get hasCache(): boolean {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value) {
      try {
        JSON.parse(value) as CacheState
        return true
      } catch {}
    }
    return false
  }

  static get isCacheEmptyOrDefault(): boolean {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value) {
      try {
        const cache = JSON.parse(value) as CacheState
        return (
          !cache.queue.length &&
          !cache.pinContent &&
          !cache.reference &&
          !cache.videoRaw.description &&
          !cache.videoRaw.title &&
          !cache.videoRaw.sources.length
        )
      } catch {}
    }
    return true
  }

  static loadState(beeClient: BeeClient, gatewayClient: GatewayClient, gatewayType: GatewayType) {
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
    const videoWriter = new SwarmVideo.Writer(undefined, ownerAddress, {
      beeClient,
      gatewayClient,
      gatewayType,
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
      offerResources,
      hasChanges,
      descriptionExeeded: false,
      saveTo,
      sources: getAllSources(),
      indexData: [],
      isOffered: undefined,
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
