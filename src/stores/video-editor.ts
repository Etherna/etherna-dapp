import type { Image, Video } from "@etherna/api-js"
import type { VideoQuality } from "@etherna/api-js/schemas/video"
import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

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
  type: VideoEditorQueueType
  source: VideoEditorQueueSource
  identifier: string
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
  batchStatus?: "creating" | "fetching" | "updating" | "saturated"
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
  removeFromQueue(identifier: string): void
  removeVideoSource(quality: VideoQuality): void
  reset(): void
  setBatchId(batchId: string): void
  setEditingVideo(video: Video): void
  setQueueError(identifier: string, error: string): void
  setIsOffered(offered: boolean): void
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
  updateQueueIdentifier(oldIdentifier: string, newIdentifier: string): void
  updateQueueType(identifier: string, type: VideoEditorQueueType): void
  updateQueueCompletion(identifier: string, completion: number): void
  updateQueueSize(identifier: string, size: number): void
  updateMetadata(quality: VideoQuality, duration: number): void
  updateVideoReference(reference: string): void
  updateSaveTo(list: VideoEditorPublishSource[]): void
}

const getInitialState = (): VideoEditorState => ({
  reference: undefined,
  status: "creating",
  video: {
    reference: "",
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
        immer(set => ({
          ...getInitialState(),
          addToQueue(type, source, identifier) {
            set(state => {
              state.queue.push({
                type,
                source,
                identifier,
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
              state.hasChanges = true
            })
          },
          removeFromQueue(identifier) {
            set(state => {
              state.queue = state.queue.filter(q => q.identifier !== identifier)
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
            set(getInitialState())
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
          setQueueError(identifier, error) {
            set(state => {
              const queueItem = state.queue.find(q => q.identifier === identifier)
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
              state.hasChanges = true
            })
          },
          toggleOfferResources(enabled) {
            set(state => {
              state.offerResources = enabled
              state.hasChanges = true
            })
          },
          togglePinContent(enabled) {
            set(state => {
              state.pinContent = enabled
              state.hasChanges = true
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
              state.hasChanges = true
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
          updateQueueIdentifier(oldIdentifier, newIdentifier) {
            set(state => {
              const queueItem = state.queue.find(q => q.identifier === oldIdentifier)
              if (queueItem) {
                queueItem.identifier = newIdentifier
              }
            })
          },
          updateQueueType(identifier, type) {
            set(state => {
              const queueItem = state.queue.find(q => q.identifier === identifier)
              if (queueItem) {
                queueItem.type = type
              }
            })
          },
          updateQueueCompletion(identifier, completion) {
            set(state => {
              const index = state.queue.findIndex(q => q.identifier === identifier)
              if (index >= 0) {
                state.queue[index].completion = completion
              }
              state.hasChanges = true
            })
          },
          updateQueueSize(identifier, size) {
            set(state => {
              const index = state.queue.findIndex(q => q.identifier === identifier)
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
              state.hasChanges = true
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
            return JSON.stringify(state)
          },
        }
      )
    )
  )
)

export default useVideoEditorStore
