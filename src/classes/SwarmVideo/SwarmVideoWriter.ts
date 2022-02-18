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

import SwarmVideoIO from "."
import EthernaIndexClient from "@classes/EthernaIndexClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import SwarmImageIO from "@classes/SwarmImage"
import { getVideoDuration, getVideoResolution } from "@utils/media"
import type { SwarmVideoUploadOptions, SwarmVideoWriterOptions } from "./types"
import type { SwarmVideoQuality, SwarmVideoRaw, Video } from "@definitions/swarm-video"
import type { SwarmImageRaw } from "@definitions/swarm-image"
import type { IndexVideo } from "@definitions/api-index"
import type { Profile } from "@definitions/swarm-profile"

/**
 * Load/Update video info over swarm
 */
export default class SwarmVideoWriter {
  ownerAddress: string
  reference?: string
  indexReference?: string
  video?: Video

  private _videoRaw: SwarmVideoRaw
  private beeClient: SwarmBeeClient
  private indexClient: EthernaIndexClient

  static thumbnailResponsiveSizes = [480, 960, 1440, 2400]

  constructor(video: Video | undefined, ownerAddress: string, opts: SwarmVideoWriterOptions) {
    this.beeClient = opts.beeClient
    this.indexClient = opts.indexClient
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
    this._videoRaw.duration = value
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

  /**
   * Update video meta on swarm & reference on index.
   * 
   * @param ownerProfile Profile data of the owner (assigned to `this.video` object) - optional when updating
   * @returns The reference hash of the video feed  
   */
  async update(ownerProfile?: Profile): Promise<string> {
    if (!this._videoRaw.sources.length) throw new Error("Please add at least 1 video source")
    if (!this.beeClient.signer) throw new Error("Enable your wallet to update your profile")

    // update meta
    if (!this.reference) {
      this.videoRaw.createdAt = +new Date()
    }
    const rawVideo = this.videoRaw
    const batchId = await this.beeClient.getBatchId()
    const videoReference = (await this.beeClient.uploadFile(batchId, JSON.stringify(rawVideo))).reference

    // update index video
    const indexSuccess = await this.updateCreateIndexVideo(videoReference)

    if (!indexSuccess) throw new Error("Cannot add video on the current Index")

    // update local instances
    this.reference = videoReference

    const reader = new SwarmVideoIO.Reader(videoReference, this.ownerAddress, {
      beeClient: this.beeClient,
      indexClient: this.indexClient,
      videoData: rawVideo,
      profileData: this.video?.owner ?? ownerProfile,
    })
    this.video = reader.video

    return videoReference
  }

  async deleteVideo() {
    if (!this.reference) throw new Error("Please provide a video reference before")

    try {
      await Promise.allSettled([
        this.beeClient.unpin(this.reference),
        ...this._videoRaw.sources.map(source => this.beeClient.unpin(source.reference))
      ])
    } catch { }
    try {
      await this.indexClient.videos.deleteVideo(this.reference)
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

    const batchId = await this.beeClient.getBatchId()
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
      batchId,
      new Uint8Array(video),
      undefined,
      {
        contentType,
        fetch,
      }
    )).reference

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

    return reference
  }

  async addThumbnail(buffer: ArrayBuffer, contentType: string, opts?: SwarmVideoUploadOptions) {
    this._videoRaw.thumbnail = await new SwarmImageIO.Writer(new Blob([buffer], { type: contentType }) as File, {
      beeClient: this.beeClient,
      isResponsive: true,
      responsiveSizes: SwarmVideoWriter.thumbnailResponsiveSizes
    }).upload({
      onCancelToken: opts?.onCancelToken,
      onUploadProgress: opts?.onUploadProgress,
    })

    return SwarmImageIO.Reader.getOriginalSourceReference(this._videoRaw.thumbnail)!
  }

  async removeVideoSource(quality: SwarmVideoQuality) {
    const sourceIndex = this._videoRaw.sources.findIndex(source => source.quality === quality)
    if (sourceIndex === -1) {
      throw new Error("There is no video source with this quality")
    }

    this._videoRaw.sources.splice(sourceIndex, 1)
  }

  async removeThumbnail() {
    if (!this._videoRaw.thumbnail) {
      throw new Error("There is no thumbnail to remove")
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
      indexClient: this.indexClient,
    })
  }

  // Private methods

  private async updateCreateIndexVideo(newReference: string): Promise<boolean> {
    try {
      if (this.indexReference) {
        await this.indexClient.videos.updateVideo(this.indexReference, newReference)
      } else {
        await this.indexClient.videos.createVideo(newReference)
      }
      return true
    } catch (error) {
      console.error(error)
      return false
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
      createdAt: video.creationDateTime ? +new Date(video.creationDateTime) : video.createdAt,
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
