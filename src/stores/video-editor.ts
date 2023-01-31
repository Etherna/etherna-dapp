import { VideoBuilder } from "@etherna/api-js/swarm"
import {
  bytesReferenceToReference,
  extractVideoReferences,
  getNodesWithPrefix,
} from "@etherna/api-js/utils"
import produce from "immer"
import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import { uuidv4Short } from "@/utils/uuid"

import type { BatchLoadingType } from "@/components/common/BatchLoading"
import type { ProcessedImage, Video } from "@etherna/api-js"
import type { BeeClient, Reference } from "@etherna/api-js/clients"
import type { VideoQuality } from "@etherna/api-js/schemas/video"
import type { WritableDraft } from "immer/dist/internal"

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

const getInitialState = (): VideoEditorState => ({
  reference: undefined,
  references: [],
  initialized: false,
  status: "creating",
  builder: new VideoBuilder.Immerable(),
  hasChanges: false,
  queue: [],
  pinContent: false,
  isOffered: undefined,
  offerResources: false,
  indexData: [],
  saveTo: [],
})

type SetFunc = (
  setFunc: Partial<VideoEditorState> | ((state: WritableDraft<VideoEditorState>) => void)
) => void
type GetFunc = () => VideoEditorState

const actions = (set: SetFunc, get: GetFunc) => ({
  addToQueue(type: VideoEditorQueueType, source: VideoEditorQueueSource, identifier: string) {
    set(state => {
      state.queue.push({
        id: uuidv4Short(),
        type,
        source,
        name: identifier,
        completion: null,
      })
      state.hasChanges = true
    })
  },
  async addVideoSource(mp4: Uint8Array) {
    const builder = await produce(get().builder, async draft => {
      await draft.addMp4Source(mp4)
    })
    set(state => {
      state.builder = builder
      state.hasChanges = true
    })
  },
  getThumbEntry() {
    const thumbsNodes = getNodesWithPrefix(get().builder.node, "thumb/")
    const entry = thumbsNodes[0]?.getEntry
    return entry ? bytesReferenceToReference(entry) : undefined
  },
  getVideoEntry(path: string) {
    const thumbsNodes = getNodesWithPrefix(get().builder.node, path)
    const entry = thumbsNodes[0]?.getEntry
    return entry ? bytesReferenceToReference(entry) : undefined
  },
  getVideo(beeUrl: string) {
    return get().builder.getVideo(beeUrl)
  },
  async loadNode(beeClient: BeeClient) {
    if (get().initialized) return

    const builder = await produce(get().builder, async draft => {
      await draft.loadNode({ beeClient })
    })
    set(state => {
      state.builder = builder
      state.initialized = true
    })
  },
  removeFromQueue(id: string) {
    set(state => {
      state.queue = state.queue.filter(q => q.id !== id)
      state.hasChanges = true
    })
  },
  removeVideoSource(quality: VideoQuality) {
    const builder = produce(get().builder, draft => {
      draft.removeMp4Source(quality)
    })
    set(state => {
      state.builder = builder
      state.hasChanges = true
    })
  },
  reset() {
    const state = get()
    const newState = getInitialState()
    newState.saveTo = state.saveTo.map(src => ({ ...src, videoId: undefined, add: true }))
    set(newState)
  },
  async saveNode(beeClient: BeeClient) {
    const builder = await produce(get().builder, async draft => {
      await draft.saveNode({ beeClient })
    })
    set(state => {
      state.builder = builder
    })
    return builder.reference
  },
  setBatchId(batchId: string) {
    set(state => {
      state.builder.detailsMeta.batchId = batchId
      state.hasChanges = true
    })
  },
  setInitialState(ownerAddress: string, video?: Video | null) {
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
  setQueueError(id: string, error: string) {
    set(state => {
      const queueItem = state.queue.find(q => q.id === id)
      if (queueItem) {
        queueItem.error = error
      }
    })
  },
  setIsOffered(offered: boolean) {
    set(state => {
      state.isOffered = offered
    })
  },
  setPublishingSources(sources: VideoEditorPublishSource[]) {
    set(state => {
      state.saveTo = sources
    })
  },
  setPublishingResults(results: PublishStatus[] | undefined) {
    set(state => {
      state.publishingResults = results
    })
  },
  setThumbnail(thumbnail: ProcessedImage | null) {
    const builder = produce(get().builder, draft => {
      draft.previewMeta.thumbnail = thumbnail
        ? {
            aspectRatio: thumbnail.aspectRatio,
            blurhash: thumbnail?.blurhash,
            sources: [],
          }
        : null
      for (const source of thumbnail?.responsiveSourcesData || []) {
        draft.addThumbnailSource(source.data, source.width, source.type)
      }
    })
    set(state => {
      state.builder = builder
      state.queue = state.queue.filter(q => q.source === "thumbnail")
      state.hasChanges = true
    })
  },
  toggleOfferResources(enabled: boolean) {
    set(state => {
      state.offerResources = enabled
    })
  },
  togglePinContent(enabled: boolean) {
    set(state => {
      state.pinContent = enabled
    })
  },
  togglePublishTo(source: VideoEditorPublishSourceType, identifier: string, enabled: boolean) {
    set(state => {
      const index = state.saveTo.findIndex(s => s.source === source && s.identifier === identifier)
      if (index >= 0) {
        state.saveTo[index].add = enabled
      }
    })
  },
  updateBatchStatus(status: VideoEditorState["batchStatus"]) {
    set(state => {
      state.batchStatus = status
    })
  },
  updateEditorStatus(status: "saved" | "error") {
    set(state => {
      state.status = status
      state.hasChanges = true
    })
  },
  updateTitle(title: string) {
    set(state => {
      state.builder.previewMeta.title = title
      state.hasChanges = true
    })
  },
  updateDescription(description: string) {
    set(state => {
      state.builder.detailsMeta.description = description
      state.hasChanges = true
    })
  },
  updateQueueName(id: string, newName: string) {
    set(state => {
      const queueItem = state.queue.find(q => q.id === id)
      if (queueItem) {
        queueItem.name = newName
      }
    })
  },
  updateQueueType(id: string, type: VideoEditorQueueType) {
    set(state => {
      const queueItem = state.queue.find(q => q.id === id)
      if (queueItem) {
        queueItem.type = type
      }
    })
  },
  updateQueueCompletion(id: string, completion: number) {
    set(state => {
      const index = state.queue.findIndex(q => q.id === id)
      if (index >= 0) {
        state.queue[index].completion = completion
      }
      state.hasChanges = true
    })
  },
  updateQueueSize(id: string, size: number) {
    set(state => {
      const index = state.queue.findIndex(q => q.id === id)
      if (index >= 0) {
        state.queue[index].size = size
      }
      state.hasChanges = true
    })
  },
  updateQueueError(id: string, error: string | undefined) {
    set(state => {
      const index = state.queue.findIndex(q => q.id === id)
      if (index >= 0) {
        state.queue[index].error = error
        state.queue[index].completion = 0
      }
      state.hasChanges = true
    })
  },
  updateSaveTo(list: VideoEditorPublishSource[]) {
    set(state => {
      state.saveTo = list
    })
  },
})

const useVideoEditorStore = create<VideoEditorState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          ...actions(set, get),
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
            state.state.builder = new VideoBuilder.Immerable()
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
