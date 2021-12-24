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

import { getDefaultRawVideo, getDefaultVideo } from "."
import EthernaIndexClient from "@classes/EthernaIndexClient"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import SwarmImageIO from "@classes/SwarmImage"
import SwarmProfileIO from "@classes/SwarmProfile"
import type { SwarmVideoReaderOptions } from "./types"
import type { Profile } from "@definitions/swarm-profile"
import type { IndexVideo } from "@definitions/api-index"
import type { SwarmVideo, SwarmVideoRaw, Video } from "@definitions/swarm-video"

/**
 * Load/Update video info over swarm
 */
export default class SwarmVideoReader {
  reference: string
  ownerAddress?: string
  video: Video
  videoRaw: SwarmVideoRaw
  loadedFromPrefetch: boolean = false
  fetchProfile: boolean
  fetchFromCache: boolean
  updateCache: boolean

  private beeClient: SwarmBeeClient
  private indexClient: EthernaIndexClient
  private indexData?: IndexVideo
  private profileData?: Profile

  constructor(reference: string, ownerAddress: string | undefined, opts: SwarmVideoReaderOptions) {
    this.reference = reference
    this.ownerAddress = ownerAddress
    this.beeClient = opts.beeClient
    this.indexClient = opts.indexClient
    this.indexData = opts.indexData
    this.profileData = opts.profileData
    this.fetchProfile = opts.fetchProfile || true
    this.fetchFromCache = opts.fetchFromCache || true
    this.updateCache = opts.updateCache || true
    this.video = this.parseRawVideo(opts.videoData, opts.indexData, opts.profileData)
    this.videoRaw = this.parseVideo(opts.videoData)

    if (this.hasPrefetch) {
      this.loadVideoFromPrefetch()
    } else if (this.hasCache && this.fetchFromCache) {
      this.loadVideoFromCache()
    }
  }

  // Props

  get hasPrefetch(): boolean {
    const prefetchVideo = window.prefetchData?.video
    return prefetchVideo?.reference === this.reference
  }

  get hasCache(): boolean {
    return false
  }


  // Public methods

  /**
   * Download and parse the video information
   * 
   * @param forced If true will download the video even with prefetched data (default = false)
   * @returns The video object
   */
  async download(forced = false) {
    if (this.loadedFromPrefetch && !forced) return this.video

    const [indexData, rawVideo, ownerProfile] = await Promise.all([
      this.indexData ? Promise.resolve(this.indexData) : this.fetchIndexVideo(),
      this.fetchRawVideo(),
      this.profileData
        ? Promise.resolve(this.profileData)
        : this.fetchProfile && this.ownerAddress
          ? this.fetchOwnerProfile(this.ownerAddress)
          : Promise.resolve(undefined)
    ])

    // Add owner address if empty
    rawVideo.ownerAddress = rawVideo.ownerAddress || indexData?.ownerAddress || ""

    let owner = ownerProfile
    if (!owner && rawVideo.ownerAddress) {
      owner = await this.fetchOwnerProfile(rawVideo.ownerAddress)
    }

    const video = this.parseRawVideo(rawVideo, indexData, owner)

    // Fix empty address with default
    video.ownerAddress = video.ownerAddress || "0x0"

    if (this.updateCache) {
      this.updateVideoCache(video)
    }

    return video
  }

  parseRawVideo(
    rawVideo: SwarmVideoRaw | Video | null | undefined,
    indexData?: IndexVideo | null,
    owner?: Profile | null,
  ): Video {
    if (!rawVideo) {
      return getDefaultVideo(this.reference, indexData, this.beeClient)
    }

    return {
      reference: this.reference,
      id: rawVideo.id,
      title: rawVideo.title,
      description: rawVideo.description,
      originalQuality: rawVideo.originalQuality,
      ownerAddress: rawVideo.ownerAddress || indexData?.ownerAddress || "",
      owner: "owner" in rawVideo ? rawVideo.owner : owner ?? undefined,
      duration: rawVideo.duration,
      thumbnail: rawVideo.thumbnail
        ? new SwarmImageIO.Reader(rawVideo.thumbnail, { beeClient: this.beeClient }).image
        : null,
      sources: rawVideo.sources.map(rawSource => ({
        ...rawSource,
        source: this.beeClient.getBzzUrl(rawSource.reference)
      })),
      isVideoOnIndex: !!indexData,
      creationDateTime: indexData?.creationDateTime,
      encryptionKey: indexData?.encryptionKey,
      encryptionType: indexData?.encryptionType,
      totDownvotes: indexData?.totDownvotes,
      totUpvotes: indexData?.totUpvotes,
    }
  }

  parseVideo(video: Video | SwarmVideoRaw | null | undefined): SwarmVideoRaw {
    if (!video) {
      return getDefaultRawVideo(this.reference)
    }

    return {
      id: video.id,
      title: video.title ?? "",
      description: video.description ?? "",
      originalQuality: video.originalQuality ?? `${NaN}p`,
      ownerAddress: video.ownerAddress ?? this.ownerAddress ?? "",
      duration: video.duration,
      thumbnail: video.thumbnail
        ? new SwarmImageIO.Reader(video.thumbnail, { beeClient: this.beeClient }).imageRaw
        : null,
      sources: video.sources.map(source => ({
        reference: source.reference,
        size: source.size,
        bitrate: source.bitrate,
        quality: source.quality,
      })),
    }
  }

  // Private methods

  private async fetchIndexVideo(): Promise<IndexVideo | null> {
    try {
      return await this.indexClient.videos.fetchVideo(this.reference)
    } catch {
      return null
    }
  }

  private async fetchRawVideo() {
    try {
      const resp = await this.beeClient.downloadFile(this.reference)
      const meta = resp.data.json() as SwarmVideoRaw
      return this.parseVideo(meta)
    } catch (error) {
      console.error(error)
    }
    return this.parseVideo(null)
  }

  private async fetchOwnerProfile(address: string) {
    try {
      const profile = new SwarmProfileIO.Reader(address, {
        beeClient: this.beeClient
      })
      return await profile.download()
    } catch {
      return undefined
    }
  }

  private loadVideoFromPrefetch() {
    const prefetchVideo = window.prefetchData?.video
    if (prefetchVideo) {
      this.video = prefetchVideo
      this.loadedFromPrefetch = true
    }
  }

  private async loadVideoFromCache() {
    if (!this.reference) return
    //
  }

  private updateVideoCache(video: Video) {
    //
  }

}
