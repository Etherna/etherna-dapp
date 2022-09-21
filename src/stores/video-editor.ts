import type { Image, Video } from "@etherna/api-js"
import type { VideoQuality } from "@etherna/api-js/schemas/video"
import create from "zustand"
import { persist, devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

export type VideoEditorPublishSourceType = "playlist" | "index"

export type VideoEditorQueueSource = "source" | "thumbnail" | "caption"

export type VideoEditorQueueType = "upload" | "encoding"

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
  error?: string
}

export type VideoEditorState = {
  /** Initial video reference (if editing a video) */
  reference: string | undefined
  /** Current editor status */
  status: "creating" | "editing" | "saved" | "error"
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
}

export type VideoEditorActions = {
  addToqueue(type: VideoEditorQueueType, source: VideoEditorQueueSource, identifier: string): void
  addVideoSource(
    quality: VideoQuality,
    reference: string,
    size: number,
    bitrate: number,
    src: string
  ): void
  removeFromQueue(identifier: string): void
  removeThumbnail(): void
  removeVideoSource(quality: VideoQuality): void
  reset(): void
  setEditingVideo(video: Video): void
  setIsOffered(offered: boolean): void
  setPublishingSources(sources: VideoEditorPublishSource[]): void
  setThumbnail(thumbnail: Image): void
  togglePinContent(enabled: boolean): void
  togglePublishTo(source: VideoEditorPublishSourceType, identifier: string, enabled: boolean): void
  toggleOfferResources(enabled: boolean): void
  updateEditorStatus(status: "saved" | "error"): void
  updateTitle(title: string): void
  updateDescription(description: string): void
  updateQueue(identifier: string, completion: number): void
  updateMetadata(quality: VideoQuality, duration: number): void
  updateVideoReference(reference: string): void
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
          addToqueue(type, source, identifier) {
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
          removeThumbnail() {
            set(state => {
              state.video.thumbnail = null
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
          setEditingVideo(video) {
            set(state => {
              state.video = video
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
          updateQueue(identifier, completion) {
            set(state => {
              const index = state.queue.findIndex(q => q.identifier === identifier)
              if (index >= 0) {
                state.queue[index].completion = completion
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
        }
      )
    )
  )
)

export default useVideoEditorStore
