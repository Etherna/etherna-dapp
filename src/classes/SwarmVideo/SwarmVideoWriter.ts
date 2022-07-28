/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import Axios from "axios"
import type { BatchId, PostageBatch } from "@ethersphere/bee-js"

import SwarmVideoIO from "."
import SwarmImageIO from "@/classes/SwarmImage"
import SwarmBatchesManager from "@/classes/SwarmBatchesManager"
import { getVideoDuration, getVideoResolution } from "@/utils/media"
import type { SwarmVideoUploadOptions, SwarmVideoWriterOptions } from "./types"
import type { SwarmVideoQuality, SwarmVideoRaw, Video } from "@/definitions/swarm-video"
import type { SwarmImageRaw } from "@/definitions/swarm-image"
import type { Profile } from "@/definitions/swarm-profile"
import { GatewayBatch } from "@/definitions/api-gateway"
import { AnyBatch } from "../SwarmBatchesManager/types"

/**
 * Load/Update video info over swarm
 */
export default class SwarmVideoWriter extends SwarmBatchesManager {
  ownerAddress: string
  reference?: string
  indexReference?: string
  video?: Video

  private _videoRaw: SwarmVideoRaw

  static thumbnailResponsiveSizes = [480, 960, 1440, 2400]

  constructor(video: Video | undefined, ownerAddress: string, opts: SwarmVideoWriterOptions) {
    super({
      address: ownerAddress,
      beeClient: opts.beeClient,
      gatewayClient: opts.gatewayClient,
      gatewayType: opts.gatewayType,
    })

    this.ownerAddress = ownerAddress
    this.reference = video?.reference
    this.indexReference = video?.indexReference
    this.video = video
    this._videoRaw = this.parseVideo(video) ?? {
      title: "",
      description: "",
      createdAt: +new Date(),
      duration: NaN,
      originalQuality: `${NaN}p`,
      ownerAddress,
      thumbnail: null,
      sources: []
    }
  }

  // Props

  get title(): string {
    return this._videoRaw.title
  }
  set title(value: string) {
    this._videoRaw.title = value
  }

  get description(): string {
    return this._videoRaw.description
  }
  set description(value: string) {
    this._videoRaw.description = value
  }

  get originalQuality(): SwarmVideoQuality {
    return this._videoRaw.originalQuality
  }
  set originalQuality(value: SwarmVideoQuality) {
    this._videoRaw.originalQuality = value
  }

  get duration(): number {
    return this._videoRaw.duration
  }
  set duration(value: number) {
    this._videoRaw.duration = Math.round(value)
  }

  get thumbnail(): SwarmImageRaw | null {
    return this._videoRaw.thumbnail
  }

  get sources() {
    return this._videoRaw.sources
  }

  get videoRaw(): SwarmVideoRaw {
    return this._videoRaw
  }
  set videoRaw(value: SwarmVideoRaw) {
    this._videoRaw = {
      ...this._videoRaw,
      ...value
    }
  }

  // Public methods

  async loadBatches(): Promise<AnyBatch[]> {
    if (!this.reference) return []

    const batchIds = Object.values(this.videoRaw.batchIds ?? {})

    return super.loadBatches(batchIds)
  }

  /**
   * Update video meta on swarm & reference on index.
   * 
   * @param ownerProfile Profile data of the owner (assigned to `this.video` object) - optional when updating
   * @returns The reference hash of the video  
   */
  async update(ownerProfile?: Profile): Promise<string> {
    if (!this._videoRaw.sources.length) throw new Error("Please add at least 1 video source")
    if (!this.beeClient.signer) throw new Error("Enable your wallet to update your profile")

    // update meta
    if (!this.reference) {
      this.videoRaw.createdAt = +new Date()
    }
    this.videoRaw.batchIds!["_"] = this.beeClient.emptyBatchId // just for size calculation

    const rawVideo = this.videoRaw
    const manifestSize = new TextEncoder().encode(JSON.stringify(rawVideo)).length

    console.log(rawVideo)

    const batch = await this.getOrCreateBatchForSize(manifestSize)

    this.videoRaw.batchIds!["_"] = this.getBatchId(batch)
    const manifestData = JSON.stringify(rawVideo)

    const videoReference = (await this.beeClient.uploadFile(this.getBatchId(batch), manifestData)).reference

    // update local instances
    this.reference = videoReference

    const reader = new SwarmVideoIO.Reader(videoReference, this.ownerAddress, {
      beeClient: this.beeClient,
      videoData: rawVideo,
      profileData: this.video?.owner ?? ownerProfile,
    })
    this.video = reader.video

    return videoReference
  }

  async unpinVideo() {
    if (!this.reference) throw new Error("Please provide a video reference before")

    try {
      await Promise.allSettled([
        this.beeClient.unpin(this.reference),
        ...Object.entries(this._videoRaw.thumbnail?.sources ?? {})
          .map(([_, reference]) => this.beeClient.unpin(reference)),
        ...this._videoRaw.sources.map(source => this.beeClient.unpin(source.reference)),
      ])
    } catch { }
  }

  async addVideoSource(video: ArrayBuffer, contentType: string, opts?: SwarmVideoUploadOptions) {
    const quality = SwarmVideoIO.getSourceName(await getVideoResolution(video))

    if (this._videoRaw.sources.find(source => source.quality === quality)) {
      throw new Error("There is another video source with the same quality")
    }

    const duration = await getVideoDuration(video)
    const size = video.byteLength
    const bitrate = Math.round((size * 8) / duration)

    const fullSize = !this.reference && this.videoRaw.sources.length === 0
      ? this.calcBatchSizeForVideo(size, parseInt(quality)) // calculate batch size for first video source
      : size
    const batch = await this.getOrCreateBatchForSize(fullSize)
    const fetch = this.beeClient.getFetch({
      onUploadProgress: e => {
        if (opts?.onUploadProgress) {
          const progress = Math.round((e.loaded * 100) / e.total)
          opts.onUploadProgress(progress)
        }
      },
      cancelToken: new Axios.CancelToken(function executor(c) {
        if (opts?.onCancelToken) {
          opts.onCancelToken(c)
        }
      }),
    })

    const reference = (await this.beeClient.uploadFile(
      this.getBatchId(batch),
      new Uint8Array(video),
      undefined,
      {
        contentType,
        fetch,
      }
    )).reference
    await this.refreshBatch(batch)

    this._videoRaw.sources.push({
      quality,
      reference,
      size,
      bitrate,
    })

    if (SwarmVideoIO.getSourceQuality(quality) > SwarmVideoIO.getSourceQuality(this._videoRaw.originalQuality)) {
      this._videoRaw.originalQuality = quality
    }

    this.sortSources()
    this.addReferenceBatch(reference, this.getBatchId(batch))

    return reference
  }

  async removeVideoSource(quality: SwarmVideoQuality) {
    const sourceIndex = this._videoRaw.sources.findIndex(source => source.quality === quality)
    if (sourceIndex === -1) {
      throw new Error("There is no video source with this quality")
    }

    this.removeReferenceBatch(this._videoRaw.sources[sourceIndex].reference)
    this._videoRaw.sources.splice(sourceIndex, 1)
  }

  async addThumbnail(buffer: ArrayBuffer, contentType: string, opts?: SwarmVideoUploadOptions) {
    const imageWriter = new SwarmImageIO.Writer(new Blob([buffer], { type: contentType }) as File, {
      beeClient: this.beeClient,
      isResponsive: true,
      responsiveSizes: SwarmVideoWriter.thumbnailResponsiveSizes,
    })
    const size = await imageWriter.pregenerateImages()
    const batch = await this.getOrCreateBatchForSize(size)

    this._videoRaw.thumbnail = await imageWriter.upload({
      batchId: this.getBatchId(batch),
      onCancelToken: opts?.onCancelToken,
      onUploadProgress: opts?.onUploadProgress,
    })
    await this.refreshBatch(batch)

    for (const reference of Object.values(this._videoRaw.thumbnail.sources)) {
      this.addReferenceBatch(reference, this.getBatchId(batch))
    }

    return SwarmImageIO.Reader.getOriginalSourceReference(this._videoRaw.thumbnail)!
  }

  removeThumbnail() {
    if (!this._videoRaw.thumbnail) return
    for (const reference of Object.values(this._videoRaw.thumbnail.sources)) {
      this.removeReferenceBatch(reference)
    }
    this._videoRaw.thumbnail = null
  }

  getSourceUrl(quality: SwarmVideoQuality): string | undefined {
    const source = this.videoRaw.sources.find(source => source.quality === quality)
    if (source) {
      return this.beeClient.getBzzUrl(source.reference)
    }
    return undefined
  }

  resetCopy() {
    return new SwarmVideoWriter(undefined, this.ownerAddress, {
      beeClient: this.beeClient,
      gatewayClient: this.gatewayClient,
      gatewayType: this.gatewayType,
    })
  }

  // Private methods

  private addReferenceBatch(reference: string | "_", batchId: BatchId) {
    this._videoRaw.batchIds = this.videoRaw.batchIds ?? {}
    this._videoRaw.batchIds[reference] = batchId
    if (this.video) {
      this.video.batchIds = this._videoRaw.batchIds
    }
  }

  private removeReferenceBatch(reference: string | "_") {
    this._videoRaw.batchIds = this.videoRaw.batchIds ?? {}
    delete this._videoRaw.batchIds[reference]
    if (this.video) {
      this.video.batchIds = this._videoRaw.batchIds
    }
  }

  private parseVideo(video: Video | undefined): SwarmVideoRaw | null {
    if (!video) return null
    return {
      title: video.title ?? "",
      description: video.description ?? "",
      duration: video.duration,
      originalQuality: video.originalQuality ?? `${NaN}p`,
      ownerAddress: video.ownerAddress ?? "0x0",
      createdAt: video.creationDateTime ? +new Date(video.creationDateTime) : video.createdAt ?? +new Date(),
      thumbnail: video.thumbnail ? new SwarmImageIO.Reader(video.thumbnail, {
        beeClient: this.beeClient
      }).imageRaw : null,
      sources: video.sources.map(source => ({
        reference: source.reference,
        quality: source.quality,
        size: source.size,
        bitrate: source.bitrate,
      })),
    }
  }

  private sortSources() {
    const sources = this._videoRaw.sources.sort((a, b) => {
      return SwarmVideoIO.getSourceQuality(b.quality) - SwarmVideoIO.getSourceQuality(a.quality)
    })
    this._videoRaw.sources = sources
  }
}
