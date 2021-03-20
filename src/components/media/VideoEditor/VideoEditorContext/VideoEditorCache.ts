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
        JSON.parse(value)
        return true
      } catch {}
    }
    return false
  }

  static loadState(beeClient: SwarmBeeClient, indexClient: EthernaIndexClient) {
    const value = window.localStorage.getItem(STORAGE_KEY)!
    const { reference, manifest, queue, videoRaw, pinContent } = JSON.parse(value) as CacheState
    const videoHandler = new SwarmVideo(reference, {
      beeClient,
      indexClient,
      fetchFromCache: false,
      fetchProfile: false
    })
    videoHandler.hash = manifest
    videoHandler.videoRaw = videoRaw

    const state: VideoEditorContextState = {
      reference,
      manifest,
      queue,
      videoHandler,
      pinContent
    }

    return state
  }

  static saveState(state: VideoEditorContextState) {
    const { reference, manifest, queue, videoHandler, pinContent } = state
    const videoRaw = videoHandler.videoRaw
    const cacheState: CacheState = {
      reference,
      manifest,
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
