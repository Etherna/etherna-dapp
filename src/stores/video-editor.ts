import { VideoBuilder } from "@etherna/sdk-js/swarm"
import {
  bytesReferenceToReference,
  extractVideoReferences,
  getNodesWithPrefix,
} from "@etherna/sdk-js/utils"
import { createDraft } from "immer"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { BatchLoadingType } from "@/components/common/BatchLoading"
import type { ProcessedImage, Video } from "@etherna/sdk-js"
import type {
  BatchId,
  BeeClient,
  EthAddress,
  PostageBatch,
  Reference,
} from "@etherna/sdk-js/clients"
import type { VideoQuality, VideoSourceRaw } from "@etherna/sdk-js/schemas/video"
import type { Draft } from "immer"
import type { StorageValue } from "zustand/middleware"

export type VideoEditorPublishSourceType = "playlist" | "index"
export type VideoEditorQueueSource = "source" | "thumbnail" | "caption"
export type VideoEditorQueueType = "upload" | "encoding"
export type VideoEditorProcessStatus = "idle" | "loading" | "progress" | "done" | "error"

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

export type VideoEditorState = {
  /** Initial main video reference (if editing a video) */
  reference: Reference | undefined
  /** Initial video references for all resources (if editing a video) */
  references: Reference[]
  /** Whether the mantaray node has been initialized */
  initialized: boolean
  /** Initial video sources (used to donwload original for econding) */
  initialSources?: VideoSourceRaw[]
  /** Current editor status */
  status: "creating" | "editing" | "saved" | "error"
  /** Video manifest builder */
  builder: VideoBuilder
  /** Whether the user made come changes */
  hasChanges: boolean
  /** upload video */
  inputFile?: File
  /** Encoding status */
  encoding: {
    status: VideoEditorProcessStatus
    progress?: number
  }
  /** Upload status */
  upload: {
    status: VideoEditorProcessStatus
    progress?: number
  }
  /** Batch status */
  batch: {
    status?: BatchLoadingType
    batchId?: BatchId
    batch?: PostageBatch | null
  }
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
  encoding: {
    status: "idle",
  },
  upload: {
    status: "idle",
  },
  batch: {},
  pinContent: false,
  isOffered: undefined,
  offerResources: false,
  inputFile: undefined,
  indexData: [],
  saveTo: [],
})

type SetFunc = (
  setFunc: Partial<VideoEditorState> | ((state: Draft<VideoEditorState>) => void)
) => void
type GetFunc = () => VideoEditorState

const actions = (set: SetFunc, get: GetFunc) => ({
  async addVideoSource(mp4: Uint8Array) {
    const builder = createDraft(get().builder)
    await builder.addMp4Source(mp4)

    set(state => {
      state.builder = builder
      state.hasChanges = true
    })
  },
  async addVideoAdaptiveSource(
    type: "dash" | "hls",
    data: Uint8Array,
    fileName: string,
    fullSize: number
  ) {
    const builder = createDraft(get().builder)
    await builder.addAdaptiveSource(type, data, fileName, fullSize)

    set(state => {
      state.builder = builder
      state.hasChanges = true
    })
  },
  getThumbEntry() {
    const thumbsNodes = getNodesWithPrefix(get().builder.node, "thumb/")
    const entry = thumbsNodes[0]?.entry
    return entry ? bytesReferenceToReference(entry) : undefined
  },
  getVideoEntry(path: string) {
    const thumbsNodes = getNodesWithPrefix(get().builder.node, path)
    const entry = thumbsNodes[0]?.entry
    return entry ? bytesReferenceToReference(entry) : undefined
  },
  getVideo(beeUrl: string) {
    return get().builder.getVideo(beeUrl)
  },
  async loadNode(beeClient: BeeClient) {
    if (get().initialized) return

    const builder = createDraft(get().builder)
    await builder.loadNode({ beeClient })

    set(state => {
      state.builder = builder
      state.initialized = true
    })
  },
  removeVideoSource(quality: VideoQuality) {
    const builder = createDraft(get().builder)
    builder.removeMp4Source(quality)

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
    const builder = createDraft(get().builder)
    await builder.saveNode({ beeClient })

    set(state => {
      state.builder = builder
    })
    return builder.reference
  },
  setBatch(batchId: BatchId, loadedBatch?: PostageBatch) {
    set(state => {
      state.builder.detailsMeta.batchId = batchId
      state.batch.batchId = batchId
      state.hasChanges = true

      if (loadedBatch) {
        state.batch.batch = loadedBatch
      }
    })
  },
  setInitialState(ownerAddress: EthAddress, video?: Video | null) {
    set(state => {
      if (state.initialized) return

      if (video) {
        const needsReEncoding = video.details?.sources.every(
          source => !["hls", "dash"].includes(source.type)
        )
        state.initialSources = video.details?.sources
        state.builder.initialize(ownerAddress, video.preview, video.details)
        state.reference = video.reference as Reference
        state.references = extractVideoReferences(video)
        state.encoding.status = needsReEncoding ? "idle" : "done"
        state.encoding.progress = needsReEncoding ? undefined : 100
        state.batch.batchId = video.details?.batchId as BatchId | undefined
        state.upload.status = needsReEncoding ? "idle" : "done"
        state.upload.progress = needsReEncoding ? undefined : 100
      }
      state.builder.previewMeta.ownerAddress = ownerAddress
      state.status = video ? "editing" : "creating"
    })
  },
  setInputFile(file: File) {
    set(state => {
      state.inputFile = file
      state.hasChanges = true
    })
  },
  setIsOffered(offered: boolean) {
    set(state => {
      state.isOffered = offered
    })
  },
  setPublishingResults(results: PublishStatus[] | undefined) {
    set(state => {
      state.publishingResults = results
    })
  },
  setThumbnail(thumbnail: ProcessedImage | null) {
    const builder = createDraft(get().builder)
    builder.previewMeta.thumbnail = thumbnail
      ? {
          aspectRatio: thumbnail.aspectRatio,
          blurhash: thumbnail?.blurhash,
          sources: [],
        }
      : null
    for (const source of thumbnail?.responsiveSourcesData || []) {
      builder.addThumbnailSource(source.data, source.width, source.type)
    }

    set(state => {
      state.builder = builder
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
  updateEncodeStatus(status: VideoEditorProcessStatus, progress?: number) {
    set(state => {
      state.encoding.status = status
      state.encoding.progress = progress
    })
  },
  updateBatchStatus(status: BatchLoadingType | undefined) {
    set(state => {
      state.batch.status = status
    })
  },
  updateUploadStatus(status: VideoEditorProcessStatus, progress?: number) {
    set(state => {
      state.upload.status = status
      if (progress) {
        state.upload.progress = progress
      }
    })
  },
  updateAspectRatio(aspectRatio: number) {
    set(state => {
      state.builder.detailsMeta.aspectRatio = aspectRatio
      state.hasChanges = true
    })
  },
  updateDuration(duration: number) {
    set(state => {
      state.builder.previewMeta.duration = duration
      state.hasChanges = true
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
          storage: {
            getItem(name) {
              const serializedValue = sessionStorage.getItem(name)
              const value = serializedValue
                ? (JSON.parse(serializedValue) as StorageValue<VideoEditorState>)
                : null

              if (value) {
                const serializedBuilder = value.state.builder
                value.state.builder = new VideoBuilder.Immerable()
                try {
                  value.state.builder.deserialize(serializedBuilder)
                } catch (error) {
                  console.error(error)
                }
              }
              return value
            },
            setItem(name, value) {
              const storeState: Omit<VideoEditorState, "builder"> & {
                builder: Record<string, any>
              } = {
                ...value.state,
                encoding:
                  value.state.upload.status !== "done"
                    ? {
                        status: "idle",
                      }
                    : value.state.encoding,
                upload:
                  value.state.upload.status !== "done"
                    ? {
                        status: "idle",
                      }
                    : value.state.upload,
                batch: {
                  batch: value.state.batch.batch,
                  batchId: value.state.batch.batchId,
                  status:
                    value.state.batch.status === "creating" &&
                    !value.state.builder.detailsMeta.batchId
                      ? undefined
                      : value.state.batch.status,
                },
                builder: value.state.builder.serialize(),
                inputFile: undefined,
              }

              const serializedValue = JSON.stringify({
                version: value.version,
                state: storeState,
              })
              return sessionStorage.setItem(name, serializedValue)
            },
            removeItem(name) {
              return sessionStorage.removeItem(name)
            },
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
