import { ChunksUploader } from "@etherna/api-js/classes"
import { BatchesHandler } from "@etherna/api-js/handlers"
import { BatchUpdateType } from "@etherna/api-js/stores"
import { fileToUint8Array, getBatchSpace } from "@etherna/api-js/utils"
import { createFFmpeg } from "@ffmpeg/ffmpeg"

import { getMaxrate } from "@/utils/media"
import { settledPromise } from "@/utils/promise"
import { timeComponents } from "@/utils/time"

import type BeeClient from "./BeeClient"
import type GatewayClient from "./GatewayClient"
import type { GatewayType } from "@/types/extension-host"
import type { BatchId, PostageBatch, Reference } from "@etherna/api-js/clients"
import type { FFmpeg } from "@ffmpeg/ffmpeg"

export class BatchNotFoundError extends Error {
  constructor() {
    super("Batch not found")
  }
}

export class BatchRejectError extends Error {
  constructor() {
    super("Batch transaction rejected")
  }
}

const InputFileName = "input-video"
const DefaultQualities = [1440, 1080, 720, 480, 360]
const ConcurrentChunks = 10

export default class VideoProcessingController {
  batchId: BatchId | null = null
  filesWithSizes: { name: string; size: number }[] = []
  abortController?: AbortController

  private ffmpeg?: FFmpeg
  private beeClient?: BeeClient
  private batchHandler?: BatchesHandler
  private gatewayClient?: GatewayClient
  private gatewayType?: GatewayType
  private uploadingFile?: string
  private uploadingLevel?: number
  private uploadingChunk?: number
  private uploadedBytes = 0
  private uploadTotalSize = 0

  //  encoding events
  onDecodedAspectRatio?: (aspectRatio: number) => void
  onDecodedDuration?: (duration: number) => void
  onEncodingStart?: () => void
  onEncodingProgress?: (progress: number) => void
  onEncodingComplete?: (files: { name: string; size: number }[]) => void
  onEncodingError?: (error: Error) => void
  onEncodedThumbnail?: (thumbnail: Uint8Array) => void
  // upload events
  onUploadStart?: () => void
  onUploadProgress?: (progress: number) => void
  onFileUploaded?: (path: string, data: Uint8Array, reference: Reference) => Promise<void> | void
  onUploadComplete?: () => void
  onUploadError?: (error: Error) => void
  // batch events
  onBatchPayingRequest?: (depth: number, amount: string) => Promise<boolean>
  onBatchCreating?: () => void
  onBatchUpdating?: () => void
  onBatchCreated?: (batchId: BatchId) => void
  onBatchLoading?: () => void
  onBatchLoaded?: (batch: PostageBatch) => void
  onBatchWaiting?: () => void
  onBatchError?: (error: Error) => void

  constructor(public reference: Reference | undefined) {}

  // static

  public static ManifestNameRegex = /(manifest|audio|[0-9]{3,}p)\.(mpd|m3u8)$/
  public static MediaManifestNameRegex = /(audio|[0-9]{3,}p)\.(mpd|m3u8)$/
  public static MediaNameRegex = (quality?: string) =>
    new RegExp(`(${quality ?? "audio|[0-9]{3,}p"}).(ts|mp4|webm)$`)

  // encoding methods

  public async startEncoding(inputFile: File) {
    this.stopEncoding()

    this.ffmpeg = createFFmpeg({
      log: import.meta.env.DEV,
      progress: ({ ratio }) => {
        this.onEncodingProgress?.(ratio * 100)
      },
    })

    this.onEncodingStart?.()

    await this.ffmpeg.load()

    this.ffmpeg.FS("writeFile", InputFileName, await fileToUint8Array(inputFile))

    // find resolution
    let height = 0
    let width = 0
    let resolutionRatio = 0
    let duration = 0

    this.ffmpeg.setLogger(({ message }) => {
      if (!message) return
      // check resolution
      const parsedSize = message.match(/\d{3,}x\d{3,}/)?.[0]
      if (parsedSize) {
        const [w, h] = parsedSize.split("x").map(Number)
        height = h
        width = w
        resolutionRatio = w / h
      }
      // check duration
      const parsedDuration = message.match(/Duration: (\d{2}:\d{2}:\d{2})/)?.[1]
      if (parsedDuration) {
        const [h, m, s] = parsedDuration.split(":").map(Number)
        duration = h * 3600 + m * 60 + s
      }
      // check failed conversion
      if (message.includes("Conversion failed!")) {
        this.onEncodingError?.(new Error("Failed to convert video"))
        this.stopEncoding()
      }
    })

    const [, probeError] = await settledPromise(
      this.ffmpeg.run(`-i`, `${InputFileName}`, `-hide_banner`, `-f`, `null`)
    )

    if (probeError) {
      return this.onEncodingError?.(probeError)
    }

    if (!resolutionRatio || !height) {
      throw new Error("Failed to decode video resolution")
    }
    if (!duration) {
      throw new Error("Failed to decode video duration")
    }

    this.onDecodedAspectRatio?.(resolutionRatio)
    this.onDecodedDuration?.(duration)

    const resolutions = DefaultQualities.filter(q => q <= height).map(q => ({
      width: q * Math.round(resolutionRatio),
      height: q,
    }))

    const randomFrameTime = timeComponents(Math.floor(Math.random() * duration))
    const thumbFrame = `${randomFrameTime.hours ?? "00"}:${randomFrameTime.minutes}:${
      randomFrameTime.seconds
    }`

    const dirFiles = this.ffmpeg.FS("readdir", ".")
    !dirFiles.includes("hls") && this.ffmpeg.FS("mkdir", "hls")

    // perform encoding
    const args = [
      "-y",
      "-hide_banner",
      "-i",
      InputFileName,
      ...resolutions
        .map(() => [`-map`, `0:v:0`, `-map`, `0:a:0`])
        .concat(["-map", "0:a:0"])
        .flat(),
      ...resolutions
        .map(({ width, height }, i) => [`-filter:v:${i}`, `scale=w=${width}:h=${height}`])
        .flat(),
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-var_stream_map",
      `${resolutions
        .map(({ height }, i) => `v:${i},a:${i},name:${height}p`)
        .concat([`a:${resolutions.length},name:audio`])
        .join(" ")}`,
      ...resolutions
        .map(({ height }, i) => [
          `-maxrate:v:${i}`,
          `${getMaxrate(height)}k`,
          `-bufsize:v:${i}`,
          `${getMaxrate(height) * 2}k`,
        ])
        .flat(),
      "-movflags",
      "faststart",
      "-preset",
      "fast",
      "-threads",
      "0",
      "-sc_threshold",
      "0",
      "-r",
      "25",
      "-max_muxing_queue_size",
      "1024",
      "-f",
      "hls",
      "-hls_time",
      "2",
      "-hls_playlist_type",
      "vod",
      "-hls_flags",
      "single_file",
      "-master_pl_name",
      "manifest.m3u8",
      "-y",
      "hls/%v.m3u8",
      "-ss",
      thumbFrame,
      "-vframes",
      "1",
      "-vf",
      `scale=${Math.round(720 * resolutionRatio)}:720`,
      "-q:v",
      "5",
      "thumb.jpg",
    ]
    const [, encError] = await settledPromise(this.ffmpeg.run(...args))

    if (encError) {
      return this.onEncodingError?.(encError)
    }

    // check if all files have been created (sometimes it exit without throwing an error)
    const dir = this.ffmpeg.FS("readdir", ".")

    if (!dir.includes("hls")) {
      return this.onEncodingError?.(new Error("Encoding failed unexpectedly"))
    }

    if (dir.includes("thumb.jpg")) {
      const thumb = this.ffmpeg.FS("readFile", "thumb.jpg")
      this.onEncodedThumbnail?.(thumb)
    }

    const hlsDir = this.ffmpeg.FS("readdir", "hls")
    const hasMainManifest = hlsDir.includes("manifest.m3u8")
    const hasAllResolutions = resolutions
      .map(({ height }) => [`${height}p.m3u8`, `${height}p.ts`])
      .flat()
      .every(file => hlsDir.includes(file))

    if (!hasMainManifest || !hasAllResolutions) {
      return this.onEncodingError?.(new Error("Encoding failed unexpectedly"))
    }

    // get all files with sizes
    this.filesWithSizes = hlsDir
      // remove '.' and '..' files
      .filter(file => file.replace(/\./g, "") !== "")
      .map(file => ({
        name: `hls/${file}`,
        // @ts-ignore
        size: this.ffmpeg!.FS("stat", `hls/${file}`).size,
      }))

    this.onEncodingComplete?.(this.filesWithSizes)
  }

  public stopEncoding() {
    if (!this.ffmpeg) return
    if (!this.ffmpeg.isLoaded()) return

    this.ffmpeg.exit()

    const dir = this.ffmpeg.FS("readdir", ".")

    if (dir.includes(InputFileName)) {
      this.ffmpeg.FS("unlink", InputFileName)
    }

    for (const folder of ["hls", "dash"]) {
      if (dir.includes(folder)) {
        const files = this.ffmpeg.FS("readdir", folder)
        files.forEach(file => {
          this.ffmpeg!.FS("unlink", file)
        })
      }
    }
  }

  // batch methods

  public async startBatchLoading(
    beeClient: BeeClient,
    gatewayClient: GatewayClient,
    gatewayType: GatewayType,
    batchId?: BatchId | null,
    abortController?: AbortController
  ) {
    this.beeClient = beeClient
    this.gatewayClient = gatewayClient
    this.gatewayType = gatewayType
    this.abortController = abortController

    this.batchHandler = new BatchesHandler({
      beeClient: this.beeClient,
      gatewayClient: this.gatewayClient,
      gatewayType: this.gatewayType,
      network: import.meta.env.DEV ? "testnet" : "mainnet",
    })

    let batch = batchId ? await this.loadBatch(batchId) : null

    // check if should create/topup batch
    const minBatchSize = this.calcMinBatchSize()
    const available = batch ? getBatchSpace(batch).available : 0
    const shouldPay = available < minBatchSize

    if (!shouldPay && batch) {
      return this.onBatchLoaded?.(batch)
    }

    const { depth, amount } = batch
      ? await this.batchHandler.calcDepthAmountForBatch(batch, minBatchSize - available)
      : await this.batchHandler.calcDepthAmount(minBatchSize)
    const ok = shouldPay ? (await this.onBatchPayingRequest?.(depth, amount)) ?? true : true

    if (!ok) {
      return this.onBatchError?.(new BatchRejectError())
    }

    if (batch) {
      batch = await this.increaseBatch(batch, depth, amount)
    } else {
      batch = await this.createBatch()
    }

    batch && this.onBatchLoaded?.(batch)
  }

  public stopBatchOperations() {
    this.abortController?.abort()
  }

  private async createBatch() {
    if (!this.batchHandler) return this.onBatchError?.(new Error("Batch handler is missing"))

    this.onBatchCreating?.()

    const minBatchSize = this.calcMinBatchSize()

    const [batch, createError] = await settledPromise(
      this.batchHandler.createBatchForSize(minBatchSize, undefined, this.abortController?.signal)
    )

    if (createError) {
      return this.onBatchError?.(createError)
    }

    const { batchID } = this.batchHandler.parseBatch(batch!)

    this.onBatchCreated?.(batchID)
    this.onBatchWaiting?.()

    const [batchInfo, batchInfoError] = await settledPromise(
      this.batchHandler.waitBatchPropagation(batch!, BatchUpdateType.Create)
    )

    if (batchInfoError) {
      return this.onBatchError?.(batchInfoError)
    }

    this.batchId = batchID

    return this.batchHandler.parseBatch(batchInfo!)
  }

  private async increaseBatch(batch: PostageBatch, depth: number, byAmount: string) {
    if (!this.batchHandler) return this.onBatchError?.(new Error("Batch handler is missing"))

    this.onBatchUpdating?.()

    // topup batch (before dilute to avoid possible expiration)
    const [, topupError] = await settledPromise(
      this.batchHandler.topupBatch(batch.batchID, byAmount)
    )
    if (topupError) {
      return this.onBatchError?.(topupError)
    }
    await this.batchHandler.waitBatchPropagation(batch, BatchUpdateType.Topup)

    // dilute batch
    const [, diluteError] = await settledPromise(
      this.batchHandler.diluteBatch(batch.batchID, depth)
    )
    if (diluteError) {
      return this.onBatchError?.(diluteError)
    }
    this.onBatchWaiting?.()
    const finalBatch = await this.batchHandler.waitBatchPropagation(batch, BatchUpdateType.Dilute)

    return this.batchHandler.parseBatch(finalBatch)
  }

  private async loadBatch(batchId: BatchId) {
    if (!this.batchHandler) return this.onBatchError?.(new Error("Batch handler is missing"))

    this.batchId = batchId

    this.onBatchLoading?.()

    const [batch] = await this.batchHandler.loadBatches([batchId])

    if (!batch) {
      return this.onBatchError?.(new BatchNotFoundError())
    }

    return this.batchHandler.parseBatch(batch)
  }

  private calcMinBatchSize() {
    const bufferSize = 2 ** 20 * 10 // 10MB buffer for mantary metadata / manifest / thumbnail etc...
    const minBatchSize = this.filesWithSizes.reduce((acc, { size }) => acc + size, 0) + bufferSize

    return minBatchSize
  }

  // upload methods

  public async startUpload(beeClient: BeeClient, abortController?: AbortController) {
    if (!this.ffmpeg) return this.onUploadError?.(new Error("FFmpeg not initialized"))
    if (!this.batchId) return this.onUploadError?.(new Error("Postage batch is missing"))

    this.beeClient = beeClient
    this.abortController = abortController

    this.onUploadStart?.()

    this.uploadTotalSize = this.filesWithSizes.reduce((acc, { size }) => acc + size, 0)
    this.uploadedBytes = 0
    this.uploadingFile = undefined
    this.uploadingLevel = undefined
    this.uploadingChunk = undefined

    await this.resumeUpload()
  }

  public async resumeUpload() {
    if (!this.ffmpeg) return this.onUploadError?.(new Error("FFmpeg not initialized"))
    if (!this.beeClient) return this.onUploadError?.(new Error("Bee client is missing"))

    if (!this.ffmpeg.isLoaded()) {
      await this.ffmpeg.load()
    }

    const filesToUpload = this.filesWithSizes
      .slice(
        this.uploadingFile ? this.filesWithSizes.findIndex(fs => fs.name === this.uploadingFile) : 0
      )
      .map(({ name }) => name)

    const chunksUploader = new ChunksUploader(this.beeClient, ConcurrentChunks)

    for (const path of filesToUpload) {
      const data = this.ffmpeg.FS("readFile", path)

      const [reference, error] = await settledPromise(
        chunksUploader.uploadData(data, {
          batchId: this.batchId!,
          signal: this.abortController?.signal,
          currentLevel: this.uploadingLevel,
          currentChunk: this.uploadingChunk,
          onBytesUploaded: bytes => {
            this.uploadedBytes += bytes
            this.onUploadProgress?.((this.uploadedBytes / this.uploadTotalSize) * 100)
          },
        })
      )

      if (error) {
        return this.onUploadError?.(error)
      }
      await this.onFileUploaded?.(path, data, reference!)

      this.uploadedBytes += data.byteLength
    }

    this.onUploadComplete?.()
  }

  public stopUpload() {
    this.abortController?.abort()
    this.uploadTotalSize = 0
    this.uploadedBytes = 0
    this.uploadingFile = undefined
    this.uploadingLevel = undefined
    this.uploadingChunk = undefined
  }

  // utils

  public mediaSizeFromName(name: string) {
    const quality = name.match(VideoProcessingController.MediaManifestNameRegex)?.[1] ?? "-"
    const regex = VideoProcessingController.MediaNameRegex(quality)
    const media = this.filesWithSizes.find(file => regex.test(file.name))
    return media?.size ?? 0
  }
}
