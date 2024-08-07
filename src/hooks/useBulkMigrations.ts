import { useCallback, useEffect, useRef, useState } from "react"
import { BatchesHandler } from "@etherna/sdk-js/handlers"
import { extractVideoReferences, isInvalidReference } from "@etherna/sdk-js/utils"

import useBatchPaymentConfirmation from "./useBatchPaymentConfirmation"
import useChannelPlaylists from "./useChannelPlaylists"
import useErrorMessage from "./useErrorMessage"
import useWallet from "./useWallet"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SwarmVideo from "@/classes/SwarmVideo"
import VideoSaver from "@/classes/VideoSaver"
import useClientsStore from "@/stores/clients"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"
import { withAccessToken } from "@/utils/jwt"
import { getVideoAspectRatio } from "@/utils/media"
import { requiresMigration } from "@/utils/migrations"

import type { VisibilityStatus } from "./useUserVideosVisibility"
import type { VideoOffersStatus } from "./useVideoOffers"
import type { VideoEditorPublishSource } from "@/stores/video-editor"
import type { Playlist, Video } from "@etherna/sdk-js"
import type { BatchId, Reference } from "@etherna/sdk-js/clients"
import type { SwarmResourcePinStatus } from "@etherna/sdk-js/handlers"

export type MigrationStatus = {
  downloadProgress: number
  status: "downloading" | "batchId" | "saving" | "done" | "error"
  error?: Error
}

type BulkMigrationOptions = {
  sourceType: "channel" | "index"
  pinningStatus: Record<Reference, SwarmResourcePinStatus>
  offersStatus: Record<Reference, VideoOffersStatus> | undefined
  visibilityStatus: Record<Reference, VisibilityStatus[]>
}

export default function useBulkMigrations(videos: Video[] | undefined, opts: BulkMigrationOptions) {
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const beeClient = useClientsStore(state => state.beeClient)
  const gatewayClient = useClientsStore(state => state.gatewayClient)
  const indexClient = useClientsStore(state => state.indexClient)
  const [isLoading, setIsLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [videosToMigrate, setVideosToMigrate] = useState<Reference[]>([])
  const [migrationStatus, setMigrationStatus] = useState<Record<Reference, MigrationStatus>>({})
  const deferredChannelUpdates = useRef<{ remove: Reference; add: Video }[]>([])
  const abortController = useRef<AbortController>()
  const migrationArgs = useRef<{ videos: Video[]; signal: AbortSignal }>()
  const shouldContinueMigration = useRef(false)
  const { showError } = useErrorMessage()
  const { waitPaymentConfirmation } = useBatchPaymentConfirmation()

  const { channelPlaylist, replaceVideosInPlaylist } = useChannelPlaylists({
    mode: "channel",
  })
  const { isLocked } = useWallet()

  useEffect(() => {
    if (channelPlaylist && shouldContinueMigration.current) {
      continueMigration()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelPlaylist])

  useEffect(() => {
    if (videos) {
      assertVideosVersions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  const assertVideosVersions = useCallback(async () => {
    if (!videos) return

    if (isLoading) {
      abortController.current?.abort()
    }

    const controller = new AbortController()
    abortController.current = controller

    setIsLoading(true)

    if (opts.sourceType === "index") {
      const videosResults = await Promise.allSettled(
        videos
          // empty reference is a not found video
          .filter(
            video =>
              !!video.preview.reference && !isInvalidReference(video.preview.reference as Reference)
          )
          .map(video => {
            const swarmVideoReader = new SwarmVideo.Reader(video.reference, {
              beeClient,
            })
            return swarmVideoReader.download({
              mode: "full",
              signal: controller.signal,
            })
          })
      )
      const migrationVideos = videosResults
        .map((result, i) =>
          result.status === "fulfilled"
            ? (result.value ?? { reference: videos[i].reference, preview: null })
            : null
        )
        .filter(video => {
          if (!video) return false
          return !video?.preview || requiresMigration(video.preview.v)
        })
        .map(video => video!.reference)

      if (!abortController.current.signal.aborted) {
        setVideosToMigrate(migrationVideos)
      }
    } else if (opts.sourceType === "channel") {
      const migrationVideos = videos
        // empty reference is a not found video
        .filter(video => !!video.preview.reference)
        .filter(video => requiresMigration(video.preview.v))
        .map(video => video.reference)
      setVideosToMigrate(migrationVideos)
    }

    setIsLoading(false)
  }, [beeClient, isLoading, opts.sourceType, videos])

  const migrateVideo = useCallback(
    async (video: Video, channelPlaylist: Playlist, signal: AbortSignal) => {
      try {
        setMigrationStatus(state => ({
          ...state,
          [video.reference]: {
            downloadProgress: 0,
            status: "downloading",
          },
        }))

        if (!video.details) {
          const reader = new SwarmVideo.Reader(video.reference, { beeClient })
          video.details = (
            await reader.download({
              mode: "details",
              previewData: video.preview,
              signal,
              onDownloadProgress(completion) {
                setMigrationStatus(state => ({
                  ...state,
                  [video.reference]: {
                    downloadProgress: completion,
                    status: "downloading",
                  },
                }))
              },
            })
          )?.details

          if (!video.details) {
            throw new Error("Video details not found")
          }
        } else {
          setMigrationStatus(state => ({
            ...state,
            [video.reference]: {
              ...state[video.reference],
              downloadProgress: 100,
            },
          }))
        }

        if (signal.aborted) return

        // check batch existence and usability
        const batchesHandler = new BatchesHandler({
          beeClient,
          gatewayClient,
          gatewayType,
          network: import.meta.env.DEV ? "testnet" : "mainnet",
        })

        if (!video.details.aspectRatio) {
          const src = withAccessToken(video.details.sources[0].url)
          video.details.aspectRatio = await getVideoAspectRatio(src)
        }

        if (video.details.batchId) {
          const [batch] = await batchesHandler.loadBatches([video.details.batchId as BatchId])
          if (!batch || !batch.usable || !batch.exists || batch.batchTTL < 0) {
            video.details.batchId = null
          }
        }

        if (!video.details.batchId) {
          setMigrationStatus(state => ({
            ...state,
            [video.reference]: {
              ...state[video.reference],
              status: "batchId",
            },
          }))

          const batchSize = batchesHandler.calcBatchSizeForVideoSources(
            video.details.sources,
            video.preview.duration
          )

          const { depth, amount } = await batchesHandler.calcDepthAmount(batchSize)

          if (!(await waitPaymentConfirmation(depth, amount))) {
            return abortController.current?.abort()
          }

          const batch = await batchesHandler.createBatchForSize(batchSize)

          video.details.batchId = batchesHandler.getBatchId(batch)
        }

        if (signal.aborted) return

        setMigrationStatus(state => ({
          ...state,
          [video.reference]: {
            ...state[video.reference],
            status: "saving",
          },
        }))

        const initialReference = video.reference
        const previusReferences = extractVideoReferences(video)
        const isWalletConnected = !isLocked
        const isInChannel = channelPlaylist.details.videos.some(
          vid => vid.reference === initialReference
        )
        const visibility = opts.visibilityStatus[initialReference] ?? []
        const saveTo = [
          ...visibility
            .filter(v => v.sourceType === "index" && v.status !== "unindexed" && v.identifier)
            .map<VideoEditorPublishSource>(v => ({
              source: "index",
              identifier: v.sourceIdentifier,
              add: true,
              description: "",
              name: "",
              videoId: v.identifier!,
            })),
        ]

        const builder = new SwarmVideo.Builder()
        builder.initialize(video.preview.ownerAddress, video.preview, video.details)

        await builder.loadNode({ beeClient })
        const saver = new VideoSaver(builder, {
          beeClient,
          indexClient,
          gatewayClient,
          channelPlaylist,
          channelPlaylists: [],
          initialReference,
          previusReferences,
          isWalletConnected,
          saveTo,
        })
        await saver.save({
          saveManifest: true,
          offerResources: opts.offersStatus?.[initialReference].offersStatus !== "none",
          pinResources: opts.pinningStatus?.[initialReference].isPinned,
          previusResults: [],
          signal,
        })

        if (isInChannel) {
          deferredChannelUpdates.current = [
            ...deferredChannelUpdates.current,
            { remove: initialReference, add: builder.getVideo("http://localhost:1633") },
          ]
        }

        setMigrationStatus(state => ({
          ...state,
          [video.reference]: {
            ...state[video.reference],
            status: "done",
          },
        }))
      } catch (error: any) {
        setMigrationStatus(state => ({
          ...state,
          [video.reference]: {
            ...state[video.reference],
            status: "error",
            error,
          },
        }))
      }
    },
    [
      beeClient,
      gatewayClient,
      gatewayType,
      isLocked,
      indexClient,
      opts.offersStatus,
      opts.pinningStatus,
      opts.visibilityStatus,
      waitPaymentConfirmation,
    ]
  )

  const continueMigration = useCallback(async () => {
    shouldContinueMigration.current = false

    if (!migrationArgs.current) return setIsMigrating(false)
    if (!channelPlaylist) return setIsMigrating(false)

    const { videos, signal } = migrationArgs.current

    await Promise.allSettled(videos.map(vid => migrateVideo(vid, channelPlaylist, signal)))

    await replaceVideosInPlaylist(
      SwarmPlaylist.Reader.channelPlaylistId,
      deferredChannelUpdates.current
    )

    migrationArgs.current = undefined

    setIsMigrating(false)
  }, [channelPlaylist, migrateVideo, replaceVideosInPlaylist])

  const migrate = useCallback(
    async (videos: Video[], signal: AbortSignal) => {
      deferredChannelUpdates.current = []
      migrationArgs.current = { videos, signal }

      if (isMigrating) {
        return showError(
          "Already migrating",
          "Stop the current migration before starting a new one"
        )
      }

      setIsMigrating(true)

      shouldContinueMigration.current = true

      if (!channelPlaylist) {
        setIsMigrating(false)
        throw new Error("Channel playlist not found. Please try again later")
      } else {
        await continueMigration()
        console.info(deferredChannelUpdates.current)
      }
    },
    [channelPlaylist, isMigrating, continueMigration, showError]
  )

  const reset = useCallback(() => {
    migrationArgs.current = undefined
    deferredChannelUpdates.current = []
    setMigrationStatus({})
  }, [])

  return {
    videosToMigrate,
    isLoading,
    isMigrating,
    migrationStatus,
    migrate,
    reset,
  }
}
