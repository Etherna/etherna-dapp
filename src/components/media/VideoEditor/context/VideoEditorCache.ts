import { VideoEditorContextState } from "."
import SwarmVideo from "@classes/SwarmVideo"
import { SwarmVideoRaw } from "@classes/SwarmVideo/types"
import EthernaIndexClient from "@classes/EthernaIndexClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import FairosClient from "@classes/FairosClient"

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

  static loadState(beeClient: SwarmBeeClient, indexClient: EthernaIndexClient, fairosClient: FairosClient | undefined) {
    const value = window.localStorage.getItem(STORAGE_KEY)!
    const { reference, queue, videoRaw, pinContent, driver } = JSON.parse(value) as CacheState
    const videoHandler = new SwarmVideo(reference, {
      beeClient,
      indexClient,
      fairosClient,
      fetchFromCache: false,
      fetchProfile: false
    })
    videoHandler.hash = reference
    videoHandler.videoRaw = videoRaw
    videoHandler.driver = driver

    const state: VideoEditorContextState = {
      reference,
      queue,
      videoHandler,
      pinContent,
      driver
    }

    return state
  }

  static saveState(state: VideoEditorContextState) {
    const { reference, queue, videoHandler, pinContent, driver } = state
    const videoRaw = videoHandler.videoRaw

    const cacheState: CacheState = {
      reference,
      queue,
      videoRaw,
      pinContent,
      driver
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheState))
  }

  static deleteCache() {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
