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

import SwarmVideoIO from "."
import type { SwarmVideoReaderOptions } from "./types"
import type EthernaIndexClient from "@/classes/EthernaIndexClient"
import type SwarmBeeClient from "@/classes/SwarmBeeClient"
import SwarmImageIO from "@/classes/SwarmImage"
import SwarmProfileIO from "@/classes/SwarmProfile"
import type { IndexVideo } from "@/definitions/api-index"
import type { Profile } from "@/definitions/swarm-profile"
import type { SwarmVideoRaw, Video } from "@/definitions/swarm-video"

/**
 * Load/Update video info over swarm
 */
export default class SwarmVideoReader {
  reference: string
  indexReference?: string
  ownerAddress?: string
  video: Video
  videoRaw: SwarmVideoRaw
  loadedFromPrefetch: boolean = false
  fetchProfile: boolean
  fetchFromCache: boolean
  updateCache: boolean

  private beeClient: SwarmBeeClient
  private indexClient?: EthernaIndexClient
  private indexData?: IndexVideo
  private profileData?: Profile
  private isDefaultVideo: boolean

  constructor(reference: string, ownerAddress: string | undefined, opts: SwarmVideoReaderOptions) {
    this.reference = SwarmVideoIO.isSwarmReference(reference) ? reference : ""
    this.indexReference = !SwarmVideoIO.isSwarmReference(reference) ? reference : undefined
    this.ownerAddress = ownerAddress
    this.beeClient = opts.beeClient
    this.indexClient = opts.indexClient
    this.indexData = opts.indexData ?? undefined
    this.profileData = opts.profileData
    this.fetchProfile = opts.fetchProfile ?? true
    this.fetchFromCache = opts.fetchFromCache ?? true
    this.updateCache = opts.updateCache ?? true
    this.video = this.doubleParseVideo(opts.videoData, opts.indexData, opts.profileData)
    this.videoRaw = this.parseVideo(this.video)
    this.isDefaultVideo = !opts.videoData || !opts.indexData

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

    const [indexVideo, rawVideo, ownerProfile] = await Promise.all([
      this.fetchIndexVideo(),
      this.fetchRawVideo(),
      this.ownerAddress ? this.fetchOwnerProfile(this.ownerAddress) : Promise.resolve(null),
    ])

    // update local video instances
    this.video = this.doubleParseVideo(rawVideo, indexVideo, ownerProfile)
    this.videoRaw = this.parseVideo(this.video)
    this.indexReference = this.indexReference ?? indexVideo?.id

    let owner = ownerProfile
    if (!owner && this.videoRaw.ownerAddress) {
      this.ownerAddress = this.videoRaw.ownerAddress
      owner = await this.fetchOwnerProfile(this.ownerAddress)
    }

    // Fix empty address with default
    this.video.ownerAddress = this.video.ownerAddress || "0x0"
    this.video.owner = owner ?? undefined

    if (this.updateCache) {
      this.updateVideoCache(this.video)
    }

    return this.video
  }

  /**
   * Parse and merge video manifest from swarm & index
   * with priority to the index manifest.
   *
   * @param videoData Video manifest parsed or raw
   * @param indexVideoData Video data from index
   * @param owner Owner profile (optional)
   * @returns The parsed video manifest
   */
  doubleParseVideo(
    videoData: SwarmVideoRaw | Video | null | undefined,
    indexVideoData: IndexVideo | null | undefined,
    owner?: Profile | null
  ): Video {
    if (!videoData && !indexVideoData) {
      return SwarmVideoIO.getDefaultVideo(this.reference, indexVideoData, this.beeClient)
    }

    const sources =
      (indexVideoData?.lastValidManifest?.sources ?? []).length > 0
        ? indexVideoData?.lastValidManifest?.sources
        : videoData?.sources

    const indexCreationTimestamp = indexVideoData
      ? +new Date(indexVideoData.creationDateTime)
      : null
    const createdAt = indexCreationTimestamp ?? videoData?.createdAt ?? null

    return {
      reference:
        indexVideoData?.lastValidManifest?.hash || (videoData as Video).reference || this.reference,
      indexReference: indexVideoData?.id || this.indexReference,
      title: indexVideoData?.lastValidManifest?.title || videoData?.title || null,
      description: indexVideoData?.lastValidManifest?.description || videoData?.description || null,
      originalQuality:
        indexVideoData?.lastValidManifest?.originalQuality || videoData?.originalQuality || null,
      duration: indexVideoData?.lastValidManifest?.duration || videoData?.duration || 0,
      thumbnail:
        indexVideoData?.lastValidManifest?.thumbnail || videoData?.thumbnail
          ? new SwarmImageIO.Reader(
              indexVideoData?.lastValidManifest?.thumbnail || videoData?.thumbnail!,
              {
                beeClient: this.beeClient,
              }
            ).image
          : null,
      sources: (sources ?? []).map(rawSource => ({
        ...rawSource,
        source: this.beeClient.getBzzUrl(rawSource.reference),
      })),
      ownerAddress: indexVideoData?.ownerAddress || videoData?.ownerAddress || owner?.address || "",
      owner: videoData && "owner" in videoData ? videoData.owner : owner ?? undefined,
      createdAt: createdAt,
      updatedAt: indexVideoData?.lastValidManifest
        ? indexVideoData.lastValidManifest.updatedAt ?? videoData?.updatedAt ?? createdAt
        : videoData?.updatedAt ?? createdAt,
      isVideoOnIndex: !!indexVideoData,
      isValidatedOnIndex: !!indexVideoData?.lastValidManifest
        ? !SwarmVideoIO.isValidatingManifest(indexVideoData.lastValidManifest)
        : false,
      creationDateTime: indexVideoData?.creationDateTime,
      encryptionKey: indexVideoData?.encryptionKey,
      encryptionType: indexVideoData?.encryptionType,
      totDownvotes: indexVideoData?.totDownvotes,
      totUpvotes: indexVideoData?.totUpvotes,
      batchId: indexVideoData?.lastValidManifest?.batchId ?? videoData?.batchId,
      v: SwarmVideoIO.lastVersion,
    }
  }

  parseVideo(video: Video | SwarmVideoRaw | null | undefined): SwarmVideoRaw {
    if (!video) {
      return SwarmVideoIO.getDefaultRawVideo(this.reference)
    }

    return {
      title: video.title ?? "",
      description: video.description ?? "",
      createdAt: video.createdAt ?? +new Date(),
      updatedAt: video.updatedAt ?? +new Date(),
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
      batchId: video.batchId,
      v: SwarmVideoIO.lastVersion,
    }
  }

  // Private methods

  private async fetchIndexVideo(): Promise<IndexVideo | null> {
    if (this.indexData) return this.indexData
    if (!this.indexClient) return null
    try {
      return this.indexReference
        ? await this.indexClient.videos.fetchVideoFromId(this.indexReference)
        : await this.indexClient.videos.fetchVideoFromHash(this.reference)
    } catch {
      return null
    }
  }

  private async fetchRawVideo(): Promise<SwarmVideoRaw | null> {
    if (!this.isDefaultVideo) return this.videoRaw

    try {
      const resp = await this.beeClient.downloadFile(this.reference)
      const meta = resp.data.json() as SwarmVideoRaw
      return this.parseVideo(meta)
    } catch (error) {
      console.error(error)
    }
    return this.parseVideo(null)
  }

  private async fetchOwnerProfile(address: string): Promise<Profile | null> {
    if (this.profileData) return this.profileData
    if (!this.fetchProfile) return null
    try {
      const profile = new SwarmProfileIO.Reader(address, {
        beeClient: this.beeClient,
      })
      return (await profile.download()) ?? null
    } catch {
      return null
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
