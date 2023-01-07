import { VideoBuilder } from "@etherna/api-js/swarm"
import { extractVideoReferences } from "@etherna/api-js/utils"
import produce, { immerable } from "immer"
import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { uuidv4Short } from "@/utils/uuid"

import type { BatchLoadingType } from "@/components/common/BatchLoading"
import type { ProcessedImage, Video } from "@etherna/api-js"
import type { BeeClient, Reference } from "@etherna/api-js/clients"
import type { VideoQuality } from "@etherna/api-js/schemas/video"

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
  /** Initial main video reference (if editing a video) */
  reference: Reference | undefined
  /** Initial video references for all resources (if editing a video) */
  references: Reference[]
  /** Whether the mantaray node has been initialized */
  initialized: boolean
  /** Current editor status */
  status: "creating" | "editing" | "saved" | "error"
  /** Current batch status */
  batchStatus?: BatchLoadingType
  /** Video manifest builder */
  builder: VideoBuilder
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
  addVideoSource(mp4: Uint8Array): void
  getVideo(beeUrl: string): Video
  loadNode(beeClient: BeeClient): Promise<void>
  removeFromQueue(id: string): void
  removeVideoSource(quality: VideoQuality): void
  reset(): void
  saveNode(beeClient: BeeClient): Promise<Reference>
  setBatchId(batchId: string): void
  setInitialState(ownerAddress: string, video?: Video | null): void
  setQueueError(id: string, error: string): void
  setIsOffered(offered: boolean): void
  setPublishingSources(sources: VideoEditorPublishSource[]): void
  setPublishingResults(results: PublishStatus[] | undefined): void
  setThumbnail(thumbnail: ProcessedImage | null): void
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
  updateQueueError(id: string, error: string | undefined): void
  updateSaveTo(list: VideoEditorPublishSource[]): void
}

const getInitialState = (): VideoEditorState => ({
  reference: undefined,
  references: [],
  initialized: false,
  status: "creating",
  builder: new VideoBuilder(),
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
          addVideoSource(mp4: Uint8Array) {
            set(state => {
              state.builder.addMp4Source(mp4)
              state.hasChanges = true
            })
          },
          getVideo(beeUrl: string) {
            return get().builder.getVideo(beeUrl)
          },
          async loadNode(beeClient) {
            if (get().initialized) return

            const builder = await produce(get().builder, async draft => {
              await draft.loadNode({ beeClient })
            })
            set(state => {
              state.builder = builder
              state.initialized = true
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
              state.builder.removeMp4Source(quality)
              state.hasChanges = true
            })
          },
          reset() {
            const state = get()
            const newState = getInitialState()
            newState.saveTo = state.saveTo.map(src => ({ ...src, videoId: undefined, add: true }))
            set(newState)
          },
          async saveNode(beeClient) {
            const builder = await produce(get().builder, async draft => {
              await draft.saveNode({ beeClient })
            })
            set(state => {
              state.builder = builder
            })
            return builder.reference
          },
          setBatchId(batchId) {
            set(state => {
              state.builder.detailsMeta.batchId = batchId
              state.hasChanges = true
            })
          },
          setInitialState(ownerAddress, video) {
            set(state => {
              if (state.initialized) return

              if (video) {
                state.builder.initialize(video.reference, video.preview, video.details)
                state.reference = video.reference as Reference
                state.references = extractVideoReferences(video)
              }
              state.builder.previewMeta.ownerAddress = ownerAddress
              state.status = video ? "editing" : "creating"
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
              state.builder.previewMeta.thumbnail = thumbnail
                ? {
                    aspectRatio: thumbnail.aspectRatio,
                    blurhash: thumbnail?.blurhash,
                    sources: [],
                  }
                : null
              for (const source of thumbnail?.responsiveSourcesData || []) {
                state.builder.addThumbnailSource(source.data, source.width, source.type)
              }
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
              state.builder.previewMeta.title = title
              state.hasChanges = true
            })
          },
          updateDescription(description) {
            set(state => {
              state.builder.detailsMeta.description = description
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
          updateQueueError(id, error) {
            set(state => {
              const index = state.queue.findIndex(q => q.id === id)
              if (index >= 0) {
                state.queue[index].error = error
                state.queue[index].completion = 0
              }
              state.hasChanges = true
            })
          },
          updateSaveTo(list) {
            set(state => {
              state.saveTo = list
            })
          },
        })),
        {
          name: "etherna:video-editor",
          getStorage: () => sessionStorage,
          serialize(state) {
            if (
              state.state.batchStatus === "creating" &&
              !state.state.builder.detailsMeta.batchId
            ) {
              state.state.batchStatus = undefined
            }

            return JSON.stringify({
              ...state,
              state: {
                ...state.state,
                builder: state.state.builder.serialize(),
                queue: [],
              },
            })
          },
          deserialize(str) {
            const state = JSON.parse(str)
            const serializedBuilder = state.state.builder
            state.state.builder = new VideoBuilder()
            state.state.builder.deserialize(serializedBuilder)
            return state
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
