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

import { getDefaultVideo } from "."
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
    this.video = opts.videoData ?? getDefaultVideo(reference, this.beeClient)
    this.video.owner = opts.videoData?.owner ?? opts.profileData

    if (this.hasPrefetch) {
      this.loadVideoFromPrefetch()
    } else if (this.hasCache && this.fetchFromCache) {
      this.loadVideoFromCache()
    }
  }

  // Props

  get hasPrefetch(): boolean {
    const prefetchVideo = window.prefetchData?.video
    return prefetchVideo?.hash === this.reference
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

    let owner = ownerProfile
    if (!owner && rawVideo.ownerAddress) {
      owner = await this.fetchOwnerProfile(rawVideo.ownerAddress)
    }

    const video: Video = {
      ...rawVideo,
      creationDateTime: indexData?.creationDateTime,
      encryptionKey: indexData?.encryptionKey,
      encryptionType: indexData?.encryptionType,
      totUpvotes: indexData?.totUpvotes,
      totDownvotes: indexData?.totDownvotes,
      isVideoOnIndex: !!indexData,
      owner,
    }

    if (this.updateCache) {
      this.updateVideoCache(video)
    }

    return video
  }

  // Private methods

  private async fetchIndexVideo() {
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
      return this.parseRawVideo(meta)
    } catch { }

    return this.parseRawVideo(null)
  }

  private parseRawVideo(rawVideo: SwarmVideoRaw | null): SwarmVideo {
    if (!rawVideo) {
      return getDefaultVideo(this.reference, this.beeClient)
    }

    return {
      reference: this.reference,
      id: rawVideo.id,
      title: rawVideo.title,
      description: rawVideo.description,
      originalQuality: rawVideo.originalQuality,
      ownerAddress: rawVideo.ownerAddress,
      duration: rawVideo.duration,
      thumbnail: rawVideo.thumbnail
        ? new SwarmImageIO.Reader(rawVideo.thumbnail, { beeClient: this.beeClient }).image
        : null,
      sources: rawVideo.sources.map(rawSource => ({
        ...rawSource,
        source: this.beeClient.getBzzUrl(rawSource.reference)
      })),
    }
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
