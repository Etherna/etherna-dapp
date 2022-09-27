import type { Image, Video } from "@etherna/api-js"
import type { EthAddress } from "@etherna/api-js/clients"
import type { VideoQuality } from "@etherna/api-js/schemas/video"
import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { uuidv4Short } from "@/utils/uuid"

export type VideoEditorPublishSourceType = "playlist" | "index"

export type VideoEditorQueueSource = "source" | "thumbnail" | "caption"

export type VideoEditorQueueType = "upload" | "encoding"

export type PublishStatus = {
  source: VideoEditorPublishSource
  ok: boolean
  type: "add" | "remove"
}

export type VideoEditorPublishSource = {
  source: VideoEditorPublishSourceType
  /** the id for playlists or the url for the index */
  identifier: string
  name: string
  description: string
  videoId: string | undefined
  add: boolean
}

export type VideoEditorQueue = {
  id: string
  type: VideoEditorQueueType
  source: VideoEditorQueueSource
  name: string
  completion: number | null
  size?: number
  error?: string
}

export type VideoEditorState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Current editor status */
  status: "creating" | "editing" | "saved" | "error"
  /** Current batch status */
  batchStatus?: "creating" | "fetching" | "updating" | "saturated" | "not-found"
  /** Video metadata */
  video: Video
  /** Whether the user made come changes */
  hasChanges: boolean
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
  /** Sources where to publish the video to */
  saveTo: VideoEditorPublishSource[]
  /** Result status of every sources */
  publishingResults?: PublishStatus[]
}

export type VideoEditorActions = {
  addToQueue(type: VideoEditorQueueType, source: VideoEditorQueueSource, identifier: string): void
  addVideoSource(
    quality: VideoQuality,
    reference: string,
    size: number,
    bitrate: number,
    src: string
  ): void
  removeFromQueue(id: string): void
  removeVideoSource(quality: VideoQuality): void
  reset(): void
  setBatchId(batchId: string): void
  setEditingVideo(video: Video): void
  setQueueError(id: string, error: string): void
  setIsOffered(offered: boolean): void
  setOwnerAddress(address: EthAddress): void
  setPublishingSources(sources: VideoEditorPublishSource[]): void
  setPublishingResults(results: PublishStatus[] | undefined): void
  setThumbnail(thumbnail: Image | null): void
  togglePinContent(enabled: boolean): void
  togglePublishTo(source: VideoEditorPublishSourceType, identifier: string, enabled: boolean): void
  toggleOfferResources(enabled: boolean): void
  updateBatchStatus(status: VideoEditorState["batchStatus"]): void
  updateEditorStatus(status: "saved" | "error"): void
  updateTitle(title: string): void
  updateDescription(description: string): void
  updateQueueName(id: string, newName: string): void
  updateQueueType(id: string, type: VideoEditorQueueType): void
  updateQueueCompletion(id: string, completion: number): void
  updateQueueSize(id: string, size: number): void
  updateMetadata(quality: VideoQuality, duration: number): void
  updateVideoReference(reference: string): void
  updateSaveTo(list: VideoEditorPublishSource[]): void
}

const getInitialState = (): VideoEditorState => ({
  reference: undefined,
  status: "creating",
  video: {
    reference: "0".repeat(64),
    batchId: null,
    title: "",
    description: "",
    duration: 0,
    originalQuality: "0p",
    ownerAddress: "0x0",
    sources: [],
    thumbnail: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  hasChanges: false,
  queue: [],
  pinContent: false,
  isOffered: undefined,
  offerResources: false,
  indexData: [],
  saveTo: [],
})

const useVideoEditorStore = create<VideoEditorState & VideoEditorActions>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          addToQueue(type, source, name) {
            set(state => {
              state.queue.push({
                id: uuidv4Short(),
                type,
                source,
                name,
                completion: null,
              })
              state.hasChanges = true
            })
          },
          addVideoSource(quality, reference, size, bitrate, src) {
            set(state => {
              state.video.sources.push({
                quality,
                reference,
                size,
                bitrate,
                source: src,
              })
              state.queue = state.queue.filter(q => q.name !== quality)
              state.hasChanges = true
            })
          },
          removeFromQueue(id) {
            set(state => {
              state.queue = state.queue.filter(q => q.id !== id)
              state.hasChanges = true
            })
          },
          removeVideoSource(quality) {
            set(state => {
              state.video.sources = state.video.sources.filter(s => s.quality !== quality)
              state.hasChanges = true
            })
          },
          reset() {
            const state = get()
            const newState = getInitialState()
            newState.saveTo = state.saveTo.map(src => ({ ...src, videoId: undefined, add: true }))
            set(newState)
          },
          setBatchId(batchId) {
            set(state => {
              state.video.batchId = batchId
              state.hasChanges = true
            })
          },
          setEditingVideo(video) {
            set(state => {
              state.video = video
              state.reference = video.reference
              state.status = "editing"
            })
          },
          setQueueError(id, error) {
            set(state => {
              const queueItem = state.queue.find(q => q.id === id)
              if (queueItem) {
                queueItem.error = error
              }
            })
          },
          setIsOffered(offered) {
            set(state => {
              state.isOffered = offered
            })
          },
          setOwnerAddress(address) {
            set(state => {
              state.video.ownerAddress = address
            })
          },
          setPublishingSources(sources) {
            set(state => {
              state.saveTo = sources
            })
          },
          setPublishingResults(results) {
            set(state => {
              state.publishingResults = results
            })
          },
          setThumbnail(thumbnail) {
            set(state => {
              state.video.thumbnail = thumbnail
              state.queue = state.queue.filter(q => q.source === "thumbnail")
              state.hasChanges = true
            })
          },
          toggleOfferResources(enabled) {
            set(state => {
              state.offerResources = enabled
            })
          },
          togglePinContent(enabled) {
            set(state => {
              state.pinContent = enabled
            })
          },
          togglePublishTo(source, identifier, enabled) {
            set(state => {
              const index = state.saveTo.findIndex(
                s => s.source === source && s.identifier === identifier
              )
              if (index >= 0) {
                state.saveTo[index].add = enabled
              }
            })
          },
          updateBatchStatus(status) {
            set(state => {
              state.batchStatus = status
            })
          },
          updateEditorStatus(status) {
            set(state => {
              state.status = status
              state.hasChanges = true
            })
          },
          updateTitle(title) {
            set(state => {
              state.video.title = title
              state.hasChanges = true
            })
          },
          updateDescription(description) {
            set(state => {
              state.video.description = description
              state.hasChanges = true
            })
          },
          updateQueueName(id, newName) {
            set(state => {
              const queueItem = state.queue.find(q => q.id === id)
              if (queueItem) {
                queueItem.name = newName
              }
            })
          },
          updateQueueType(id, type) {
            set(state => {
              const queueItem = state.queue.find(q => q.id === id)
              if (queueItem) {
                queueItem.type = type
              }
            })
          },
          updateQueueCompletion(id, completion) {
            set(state => {
              const index = state.queue.findIndex(q => q.id === id)
              if (index >= 0) {
                state.queue[index].completion = completion
              }
              state.hasChanges = true
            })
          },
          updateQueueSize(id, size) {
            set(state => {
              const index = state.queue.findIndex(q => q.id === id)
              if (index >= 0) {
                state.queue[index].size = size
              }
              state.hasChanges = true
            })
          },
          updateMetadata(quality, duration) {
            set(state => {
              state.video.originalQuality = quality
              state.video.duration = duration
              state.hasChanges = true
            })
          },
          updateSaveTo(list) {
            set(state => {
              state.saveTo = list
            })
          },
          updateVideoReference(reference) {
            set(state => {
              state.video.reference = reference
              state.hasChanges = true
            })
          },
        })),
        {
          name: "etherna:video-editor",
          getStorage: () => sessionStorage,
          serialize(state) {
            if (state.state.batchStatus === "creating" && !state.state.video.batchId) {
              state.state.batchStatus = undefined
            }
            state.state.queue = []
            return JSON.stringify(state)
          },
        }
      ),
      {
        name: "video-editor",
      }
    )
  )
)

export default useVideoEditorStore
